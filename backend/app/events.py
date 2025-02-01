from flask_socketio import emit

from app.controller.user_transactions import PdesService, UserTransactionsController

def register_socketio_events(socketio):
    @socketio.on("connect")
    def handle_connect():
        print("[WebSocket] Client connected")
        emit("response", {"message": "Welcome to the server!"})

    @socketio.on("disconnect")
    def handle_disconnect():
        print("[WebSocket] Client disconnected")

    @socketio.on("get_transaction_history")
    def handle_get_transaction_history(auth=None, *args, **kwargs):
        print("[WebSocket] Received 'get_transaction_history' event")
        if auth:
            print("Token received:", auth.get("token"))
        else:
            print("No auth information received.")
        
        transactions = UserTransactionsController.get_all_transactions_socket()
        print("[WebSocket] Sending transaction history:", transactions)
        emit("transaction_history", {"transactions": transactions})

    # Get trade history
    @socketio.on("get_trade_history")
    def handle_get_transaction_history(current_user, *args, **kwargs):
        print("[WebSocket] Received 'get_trade_history' event")
        # if current_user:
        #     print("Token received:", current_user.get("token"))
        # else:
        #     print("No auth information received.")
        
        transactions = PdesService.get_pdes_trade_history()
        print("[WebSocket] Sending transaction history:", transactions)
        emit("transaction_history", {"transactions": transactions})

