"""
SSL Fix for Python 3.13 compatibility with urllib3 and Plaid
This module provides a comprehensive fix for the SSL context recursion error
that occurs when using urllib3 with Python 3.13.
"""

import sys
import ssl
import os

def apply_ssl_fix():
    """
    Apply SSL context fix for Python 3.13 compatibility
    """
    if sys.version_info >= (3, 13):
        try:
            import urllib3.util.ssl_
            import urllib3.poolmanager
            import urllib3.connectionpool
            
            # Store original functions
            original_create_urllib3_context = urllib3.util.ssl_.create_urllib3_context
            original_connection_from_url = urllib3.poolmanager.PoolManager.connection_from_url
            
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
                
                # Set minimum protocol version using options instead of minimum_version
                context.options |= ssl.OP_NO_TLSv1_1
                
                return context
            
            def patched_connection_from_url(self, url, **kw):
                """
                Ensure our SSL context is used for connections
                """
                if 'ssl_context' not in kw:
                    kw['ssl_context'] = patched_create_urllib3_context()
                return original_connection_from_url(self, url, **kw)
            
            # Apply patches
            urllib3.util.ssl_.create_urllib3_context = patched_create_urllib3_context
            urllib3.poolmanager.PoolManager.connection_from_url = patched_connection_from_url
            
            print("SSL fix applied successfully for Python 3.13")
            return True
            
        except Exception as e:
            print(f"Failed to apply SSL fix: {e}")
            return False
    else:
        print("SSL fix not needed for Python < 3.13")
        return True

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
