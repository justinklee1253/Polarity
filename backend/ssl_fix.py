"""
SSL Fix for Python 3.13 compatibility with urllib3 and Plaid
This module provides a comprehensive fix for the SSL context recursion error
that occurs when using urllib3 with Python 3.13.
"""

import sys
import ssl
import os

# Global flag to prevent multiple applications of the patch
_SSL_FIX_APPLIED = False

# Apply the fix immediately when this module is imported
def apply_ssl_fix_immediate():
    """
    Apply SSL context fix immediately for Python 3.13 compatibility
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
            import urllib3.connectionpool
            
            # Check if already patched to avoid recursion
            if hasattr(urllib3.util.ssl_.create_urllib3_context, '_patched'):
                print("SSL context already patched, skipping...")
                _SSL_FIX_APPLIED = True
                return True
            
            # Store original functions
            original_connection_from_url = urllib3.poolmanager.PoolManager.connection_from_url
            
            def patched_create_urllib3_context(*args, **kwargs):
                """
                Create SSL context without triggering recursion error
                """
                # Create a default SSL context directly
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
            
            def patched_connection_from_url(self, url, **kw):
                """
                Ensure our SSL context is used for connections
                """
                if 'ssl_context' not in kw:
                    kw['ssl_context'] = patched_create_urllib3_context()
                return original_connection_from_url(self, url, **kw)
            
            # Mark the function as patched to prevent re-patching
            patched_create_urllib3_context._patched = True
            
            # Apply patches
            urllib3.util.ssl_.create_urllib3_context = patched_create_urllib3_context
            urllib3.poolmanager.PoolManager.connection_from_url = patched_connection_from_url
            
            print("SSL fix applied successfully for Python 3.13")
            _SSL_FIX_APPLIED = True
            return True
            
        except Exception as e:
            print(f"Failed to apply SSL fix: {e}")
            return False
    else:
        print("SSL fix not needed for Python < 3.13")
        _SSL_FIX_APPLIED = True
        return True

def apply_ssl_fix():
    """
    Apply SSL context fix for Python 3.13 compatibility
    """
    return apply_ssl_fix_immediate()

# Note: SSL fix is NOT applied automatically to prevent Stripe recursion errors
# Call apply_ssl_fix_immediate() manually only when needed for specific services
# apply_ssl_fix_immediate()

def create_plaid_ssl_context():
    """
    Create a custom SSL context specifically for Plaid API calls
    """
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

if __name__ == "__main__":
    apply_ssl_fix()
