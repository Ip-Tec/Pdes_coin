from app import db
from app.models import Utility
from flask import Blueprint, jsonify

# Blueprint for the utility routes
utility_bp = Blueprint("utility", __name__)


@utility_bp.route("/current-price", methods=["GET"])
def get_current_price():
    # Fetch the current price from the Utility table
    utility = (
        Utility.query.first()
    )  # Assuming there's only one row for the price details
    if utility:
        return (
            jsonify(
                {
                    "pdes_price": utility.pdes_price,
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
