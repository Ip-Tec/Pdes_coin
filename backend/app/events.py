from functools import wraps
from flask_socketio import emit
from flask_jwt_extended import decode_token

from app.controller.user_transactions import PdesService, UserTransactionsController
from app.models import Utility


def authenticate_socket_event(socketio):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            sid = args[0]  # Extract socket session ID
            auth_token = socketio.server.environ.get(sid, {}).get(
                "HTTP_AUTHORIZATION", None
            )

            if not auth_token:
                emit("error", {"message": "Unauthorized: Token missing"})
                return

            # Handle Bearer token format correctly
            if auth_token.startswith("Bearer "):
                auth_token = auth_token.split(" ")[1]

            try:
                decoded_token = decode_token(auth_token)
                current_user_id = decoded_token.get(
                    "sub"
                )  # Assuming `sub` contains the user ID

                # Fetch user from DB (avoiding circular import)
                from app.models import User

                current_user = User.query.get(current_user_id)

                if not current_user:
                    emit("error", {"message": "Unauthorized: Invalid user"})
                    return
            except Exception as e:
                emit("error", {"message": "Invalid token", "error": str(e)})
                return

            return f(current_user, *args, **kwargs)

        return decorated_function

    return decorator


def register_socketio_events(socketio):
    @socketio.on("connect")
    def handle_connect():
        emit("response", {"message": "Welcome to the server!"})

    @socketio.on("disconnect")
    def handle_disconnect():
        print("[WebSocket] Client disconnected")

    @socketio.on("test_event")
    def handle_test_event():
        print("[WebSocket] Received 'test_event'")
        emit("response", {"message": "Test event successful!"})

    @socketio.on("get_transaction_history")
    @authenticate_socket_event(socketio)
    def handle_get_transaction_history(current_user=None, *args, **kwargs):
        print("[WebSocket] Received 'get_transaction_history' event")

        if not current_user:
            emit("error", {"message": "Unauthorized: Invalid user"})
            return

        transactions = UserTransactionsController.get_all_transactions_socket()
        emit("transaction_history", {"transactions": transactions})

    @socketio.on("get_trade_history")
    @authenticate_socket_event(socketio)  # Pass socketio
    def handle_get_trade_history(current_user, *args, **kwargs):
        print("[WebSocket] Received 'get_trade_history' event")

        transactions = PdesService.get_pdes_trade_history()
        emit("transaction_history", {"transactions": transactions})

    @socketio.on("get_current_price")
    def handle_get_current_price():
        print("[WebSocket] Received 'get_current_price' event")

        utility = Utility.query.first()
        # print(f"utility::::{utility}")
        if utility:
            emit(
                "trade_price",
                {
                    "pdes_buy_price": utility.pdes_buy_price,
                    "pdes_sell_price": utility.pdes_sell_price,
                    "pdes_market_cap": utility.pdes_market_cap,
                    "pdes_circulating_supply": utility.pdes_circulating_supply,
                    "pdes_supply_left": utility.pdes_supply_left,
                    "pdes_total_supply": utility.pdes_total_supply,
                },
            )
        else:
            emit("trade_price", {"error": "Price data not available"})
