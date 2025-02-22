from app import db
from app.models import Utility, RewardConfig
from flask import Blueprint, jsonify, request

# Blueprint for the utility routes
utility_bp = Blueprint("utility", __name__)


@utility_bp.route("/current-price", methods=["GET"])
def get_current_price():
    # Fetch the current price from the Utility table
    utility = (
        Utility.query.first()
    )  # Assuming there's only one row for the price details
    if utility:

        # print(
        #     {
        #         "pdes_buy_price": utility.pdes_buy_price,
        #         "pdes_sell_price": utility.pdes_sell_price,
        #         "pdes_market_cap": utility.pdes_market_cap,
        #         "pdes_circulating_supply": utility.pdes_circulating_supply,
        #         "pdes_supply_left": utility.pdes_supply_left,
        #         "pdes_total_supply": utility.pdes_total_supply,
        #     }
        # )

        return (
            jsonify(
                {
                    "pdes_buy_price": utility.pdes_buy_price,
                    "pdes_sell_price": utility.pdes_sell_price,
                    "pdes_market_cap": utility.pdes_market_cap,
                    "pdes_circulating_supply": utility.pdes_circulating_supply,
                    "pdes_supply_left": utility.pdes_supply_left,
                    "pdes_total_supply": utility.pdes_total_supply,
                }
            ),
            200,
        )
    else:
        return jsonify({"message": "Price data not available"}), 404


@utility_bp.route("/reward-percentage", methods=["POST"])
def set_reward_percentage():
    if request.method == "POST":
        data = request.get_json()
        weekly_percentage = data.get("percentage_weekly")

        if weekly_percentage is None or not (0 <= weekly_percentage <= 100):
            return jsonify({"error": "Invalid percentage value."}), 400

        reward_config = RewardConfig.query.first()
        if not reward_config:
            reward_config = RewardConfig(percentage_weekly=weekly_percentage)
            db.session.add(reward_config)
        else:
            reward_config.percentage_weekly = weekly_percentage

        db.session.commit()
        return (
            jsonify(
                {
                    "message": "Reward percentage updated successfully.",
                    "data": reward_config.serialize(),
                }
            ),
            200,
        )
