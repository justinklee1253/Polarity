from app import create_app
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Create the Flask app
app = create_app()

if __name__ == '__main__':
    # Run the development server
    debug_mode = os.getenv('FLASK_ENV') == 'development'
    app.run(
        host='0.0.0.0',
        port=int(os.getenv('PORT', 5001)),  # Changed to 5001
        debug=debug_mode
    )