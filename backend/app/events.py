from flask_socketio import emit


def register_socketio_events(socketio):
    @socketio.on("connect")
    def handle_connect():
        print("Client connected")
        emit("response", {"message": "Welcome to the server!"})

    @socketio.on("disconnect")
    def handle_disconnect():
        print("Client disconnected")

    @socketio.on("get_transaction_history")
    def handle_get_transaction_history(auth, *args, **kwargs):
        print("Token received:", auth.get("token"))
        # Simulate fetching transaction history
        transactions = [
            {"id": 1, "amount": 100, "currency": "BTC"},
            {"id": 2, "amount": 50, "currency": "ETH"},
        ]
        print("Transaction history:", transactions)
        emit("transaction_history", {"transactions": transactions})
