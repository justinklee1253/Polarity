"""
Startup SSL Fix for Python 3.13 compatibility
This module must be imported before any other modules that use urllib3
"""

import sys
import ssl

# Global flag to prevent multiple applications of the patch
_SSL_FIX_APPLIED = False

def apply_startup_ssl_fix():
    """
    Apply SSL fix at the very beginning of application startup
    """
    global _SSL_FIX_APPLIED
    
    if _SSL_FIX_APPLIED:
        print("SSL fix already applied, skipping...")
        return True
        
    if sys.version_info >= (3, 13):
        try:
            # Import urllib3 modules
            import urllib3.util.ssl_
            import urllib3.poolmanager
            
            # Check if already patched to avoid recursion
            if hasattr(urllib3.util.ssl_.create_urllib3_context, '_patched'):
                print("SSL context already patched, skipping...")
                _SSL_FIX_APPLIED = True
                return True
            
            def patched_create_urllib3_context(*args, **kwargs):
                """
                Create SSL context without triggering recursion error
                """
                # Create a default SSL context directly without calling urllib3's method
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
            
            # Mark the function as patched to prevent re-patching
            patched_create_urllib3_context._patched = True
            
            # Apply the patch
            urllib3.util.ssl_.create_urllib3_context = patched_create_urllib3_context
            
            print("Startup SSL fix applied successfully for Python 3.13")
            _SSL_FIX_APPLIED = True
            return True
            
        except Exception as e:
            print(f"Failed to apply startup SSL fix: {e}")
            return False
    else:
        print("Startup SSL fix not needed for Python < 3.13")
        _SSL_FIX_APPLIED = True
        return True

# Note: SSL fix is NOT applied automatically to prevent Stripe recursion errors
# Call apply_startup_ssl_fix() manually only when needed for specific services
# if not _SSL_FIX_APPLIED:
#     apply_startup_ssl_fix()
