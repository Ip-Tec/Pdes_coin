from app import create_app, socketio
from app.controller.scheduler import setup_scheduler

app = create_app()

if __name__ == "__main__":
    
    # Setup and start the scheduler
    setup_scheduler(app)
    
    # Use socketio.run to enable WebSocket support
    socketio.run(app, debug=True, host="0.0.0.0", port=5000)
 