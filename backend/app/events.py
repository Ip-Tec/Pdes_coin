from flask import request
from functools import wraps
from app.models import Utility
from flask_socketio import emit
from urllib.parse import parse_qs
from http.cookies import SimpleCookie
from flask_jwt_extended import decode_token
from app.controller.user_transactions import PdesService, UserTransactionsController


def authenticate_socket_event(socketio):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            sid = request.sid
            env = socketio.server.environ.get(sid, {})
            
            token = None

            # Attempt to get token from cookies
            cookie_str = env.get("HTTP_COOKIE", "")
            if cookie_str:
                cookie = SimpleCookie()
                cookie.load(cookie_str)
                if "access_token" in cookie:
                    token = cookie["access_token"].value

            # Fallback: Try Authorization header if token not in cookies
            if not token:
                auth_header = env.get("HTTP_AUTHORIZATION", None)
                if auth_header and auth_header.startswith("Bearer "):
                    token = auth_header.split(" ")[1]
            
            # Fallback: Try query string parameter
            if not token:
                query_string = env.get("QUERY_STRING", "")
                parsed_qs = parse_qs(query_string)
                token_list = parsed_qs.get("token")
                if token_list:
                    token = token_list[0]
            
            if not token:
                emit("error", {"message": "Unauthorized: Token missing"})
                return
            
            try:
                decoded_token = decode_token(token)
                current_user_id = decoded_token.get("sub")  # assuming 'sub' holds the user id
                from app.models import User  # avoid circular import
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
        current_price = handle_get_current_price()
        trade_history = handle_get_transaction_history()
        emit("response", {"message": "Welcome to the server!", "auth": auth, "current_price": current_price, "trade_history": trade_history})
    
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
        emit("get_transaction_history", {"transactions": transactions})

    
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
