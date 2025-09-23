# Note: SSL fixes removed from global startup to prevent Stripe recursion errors
# SSL fixes will be applied only when needed for specific services (like Plaid)
import sys

from app import create_app, socketio
from dotenv import load_dotenv
import os

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