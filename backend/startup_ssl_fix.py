"""
Startup SSL Fix for Python 3.13 compatibility
This module must be imported before any other modules that use urllib3
"""

import sys
import ssl

def apply_startup_ssl_fix():
    """
    Apply SSL fix at the very beginning of application startup
    """
    if sys.version_info >= (3, 13):
        try:
            # Import urllib3 modules
            import urllib3.util.ssl_
            import urllib3.poolmanager
            
            # Store original function
            original_create_urllib3_context = urllib3.util.ssl_.create_urllib3_context
            
            def patched_create_urllib3_context(*args, **kwargs):
                """
                Create SSL context without triggering recursion error
                """
                # Create a default SSL context
                context = ssl.create_default_context()
                
                # Set security options
                context.check_hostname = True
                context.verify_mode = ssl.CERT_REQUIRED
                
                # Disable old protocols
                context.options |= ssl.OP_NO_SSLv2
                context.options |= ssl.OP_NO_SSLv3
                context.options |= ssl.OP_NO_TLSv1
                context.options |= ssl.OP_NO_TLSv1_1
                
                return context
            
            # Apply the patch
            urllib3.util.ssl_.create_urllib3_context = patched_create_urllib3_context
            
            print("Startup SSL fix applied successfully for Python 3.13")
            return True
            
        except Exception as e:
            print(f"Failed to apply startup SSL fix: {e}")
            return False
    else:
        print("Startup SSL fix not needed for Python < 3.13")
        return True

# Apply the fix immediately
apply_startup_ssl_fix()
