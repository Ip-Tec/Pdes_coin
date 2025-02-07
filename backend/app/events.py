from flask import request
from functools import wraps
from app.models import Utility
from flask_socketio import emit
from urllib.parse import parse_qs
from flask_jwt_extended import decode_token
from app.controller.user_transactions import PdesService, UserTransactionsController

def authenticate_socket_event(socketio):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Use request.sid to get the session ID
            sid = request.sid
            env = socketio.server.environ.get(sid, {})
            
            # Try to get the token from HTTP_AUTHORIZATION header first
            auth_token = env.get("HTTP_AUTHORIZATION", None)
            
            # If not found, try to get it from the query string
            if not auth_token:
                query_string = env.get("QUERY_STRING", "")
                parsed_qs = parse_qs(query_string)
                token_list = parsed_qs.get("token")
                if token_list:
                    auth_token = token_list[0]
            
            if not auth_token:
                emit("error", {"message": "Unauthorized: Token missing"})
                return
            
            # Remove 'Bearer ' if present
            if auth_token.startswith("Bearer "):
                auth_token = auth_token.split(" ")[1]

            try:
                decoded_token = decode_token(auth_token)
                current_user_id = decoded_token.get("sub")  # Assuming 'sub' holds the user id
                from app.models import User  # Avoid circular import issues
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
    def handle_connect(auth):
        # The connect handler now accepts the auth parameter.
        # Optionally, you could use this auth data for additional logic.
        handle_get_current_price()
        handle_get_transaction_history()
        emit("response", {"message": "Welcome to the server!"})
    
    @socketio.on("disconnect")
    def handle_disconnect():
        print("[WebSocket] Client disconnected")
    
    @socketio.on("test_event")
    def handle_test_event():
        print("[WebSocket] Received 'test_event'")
        emit("response", {"message": "Test event successful!"})
    
    @socketio.on("get_transaction_history")
    # @authenticate_socket_event(socketio)  # Enable if you need authentication
    def handle_get_transaction_history(current_user=None, *args, **kwargs):
        print("[WebSocket] Received 'get_transaction_history' event")
        
        # Directly assign the returned data:
        transactions = UserTransactionsController.get_all_transactions_socket()
        print(f"transactions::::{transactions}")
        emit("transaction_history", {"transactions": transactions})

    
    @socketio.on("get_trade_history")
    @authenticate_socket_event(socketio)
    def handle_get_trade_history(current_user, *args, **kwargs):
        print("[WebSocket] Received 'get_trade_history' event")
        trade_history = PdesService.get_pdes_trade_history()
        emit("trade_history", {"trade_history": trade_history})

    
    @socketio.on("get_current_price")
    def handle_get_current_price():
        print("[WebSocket] Received 'get_current_price' event")
        utility = Utility.query.first()
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
