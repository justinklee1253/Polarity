from app import create_app, socketio
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Create the Flask app
app = create_app()

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5001))  # Render provides PORT env var
    debug_mode = os.getenv('FLASK_ENV') == 'development'

    socketio.run(
        app,
        host='0.0.0.0',
        port=port,
        debug=debug_mode
    )
