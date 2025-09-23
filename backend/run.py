# Apply SSL fix FIRST, before any other imports
import sys
if sys.version_info >= (3, 13):
    try:
        from startup_ssl_fix import apply_startup_ssl_fix
        apply_startup_ssl_fix()
    except ImportError:
        print("Warning: Startup SSL fix module not found in run.py, using fallback")
        import ssl
        import urllib3.util.ssl_
        
        def patched_create_urllib3_context(*args, **kwargs):
            context = ssl.create_default_context()
            context.check_hostname = True
            context.verify_mode = ssl.CERT_REQUIRED
            context.options |= ssl.OP_NO_SSLv2
            context.options |= ssl.OP_NO_SSLv3
            context.options |= ssl.OP_NO_TLSv1
            context.options |= ssl.OP_NO_TLSv1_1
            return context
        
        urllib3.util.ssl_.create_urllib3_context = patched_create_urllib3_context

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