from app import db
from app.models import AccountDetail, User
from app.services import token_required
from flask import Blueprint, request, jsonify
from bip_utils import (
    Bip39MnemonicGenerator,
    Bip39SeedGenerator,
    Bip44,
    Bip44Coins,
    Bip44Changes,
)


account_bp = Blueprint("account", __name__)


# Helper function to generate address and seed
def generate_address_and_seed(coin: str):
    # Generate a random mnemonic
    mnemonic = Bip39MnemonicGenerator().FromWordsNumber(24)
    mnemonic_str = str(mnemonic)  # Convert Bip39Mnemonic to string
    seed = Bip39SeedGenerator(mnemonic).Generate()
    bip44_ctx = Bip44.FromSeed(seed, getattr(Bip44Coins, coin))

    # Generate the address
    address = (
        bip44_ctx.Purpose()
        .Coin()
        .Account(0)
        .Change(Bip44Changes.CHAIN_EXT)
        .AddressIndex(0)
        .PublicKey()
        .ToAddress()
    )
    return address, mnemonic_str


# Route to create a new account detail
@account_bp.route("/create-account", methods=["POST"])
@token_required
def create_account(current_user, *args, **kwargs):
    # print(f"User:::{user_id}")
    user_id = current_user.id
    print(f"User ID:::{user_id}")
    print(f"User username=:::{current_user.username}")

    user = User.query.get(user_id)
    username = user.username

    if not user_id:
        return jsonify({"error": "Missing user information"}), 400

    try:
        # Generate addresses and seeds for each coin
        btc_address, btc_seed = generate_address_and_seed("BITCOIN")
        eth_address, eth_seed = generate_address_and_seed("ETHEREUM")
        ltc_address, ltc_seed = generate_address_and_seed("LITECOIN")
        usdc_address, usdc_seed = generate_address_and_seed("ETHEREUM")

        # Create a new account detail record
        account_detail = AccountDetail(
            user_id=user_id,
            BTCAddress=btc_address,
            BTCAddressSeed=btc_seed,
            ETHAddress=eth_address,
            ETHAddressSeed=eth_seed,
            LTCAddress=ltc_address,
            LTCAddressSeed=ltc_seed,
            USDCAddress=usdc_address,
            USDCAddressSeed=usdc_seed,
            PDESAddress=username,
        )
        db.session.add(account_detail)
        db.session.commit()

        return jsonify(account_detail.serialize()), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# Route to retrieve account details by user_id
@account_bp.route("/get-all-crypto-address", methods=["GET"])
@token_required
def get_all_account(current_user, *args, **kwargs):
    print(f"user_id::: {current_user.id}")
    print(f"username::: {current_user.username}")

    try:
        account_detail = AccountDetail.query.filter_by(user_id=current_user.id).all()
        if not account_detail:
            account = create_account(current_user)
            return account
        return (
            jsonify([account.serialize() for account in account_detail]),
            200,
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Route to retrieve account details by user_id
@account_bp.route("/get-crypto-address", methods=["GET"])
@token_required
def get_account(current_user, *args, **kwargs):
    print(f"user_id::: {current_user.id}")
    print(f"username::: {current_user.username}")

    try:
        account_detail = AccountDetail.query.filter_by(user_id=current_user.id).first()
        if not account_detail:
            account = create_account(current_user)
            return account
        return jsonify(account_detail.serialize()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
