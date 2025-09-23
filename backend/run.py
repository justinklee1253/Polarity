# Production-ready startup without SSL patches
import sys
import os
from dotenv import load_dotenv

# For gevent compatibility (used with gunicorn --worker-class gevent)
# Note: gevent monkey patching is handled by gunicorn when using gevent worker class

from app import create_app, socketio

# Load environment variables
load_dotenv()

# Create the Flask app
app = create_app()

if __name__ == '__main__':
    # This will only run in development
    port = int(os.getenv('PORT', 5001))
    debug_mode = os.getenv('FLASK_ENV') == 'development'
    
    socketio.run(
        app,
        host='0.0.0.0',
        port=port,
        debug=debug_mode
    )