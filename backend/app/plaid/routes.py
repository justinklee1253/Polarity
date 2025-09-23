import os
import ssl
import sys
import plaid
from plaid.api import plaid_api
from plaid.model.link_token_create_request import LinkTokenCreateRequest
from plaid.model.link_token_create_request_user import LinkTokenCreateRequestUser
from plaid.model.products import Products
from plaid.model.country_code import CountryCode
from plaid.model.accounts_balance_get_request import AccountsBalanceGetRequest
from plaid.model.item_public_token_exchange_request import ItemPublicTokenExchangeRequest
from plaid.model.transactions_get_request import TransactionsGetRequest
from plaid.model.webhook_verification_key_get_request import WebhookVerificationKeyGetRequest
# Note: For transactions days_requested, we'll pass it as a dict in the request

from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import get_jwt, jwt_required, get_jwt_identity
from flask_socketio import SocketIO, emit

from ..database import get_db_session
from ..models import User, Transaction
import json
from datetime import datetime, date
import hashlib
import hmac

# Apply SSL fix for Python 3.13 compatibility
try:
    from ...startup_ssl_fix import apply_startup_ssl_fix
    apply_startup_ssl_fix()
except ImportError:
    # Fallback if startup_ssl_fix module is not available
    print("Warning: Startup SSL fix module not found in plaid routes, using fallback")
    if sys.version_info >= (3, 13):
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

plaid_bp = Blueprint('plaid', __name__, url_prefix='/plaid')

# Initialize SocketIO (assuming you have it set up in your main app)
# socketio = SocketIO(cors_allowed_origins="*")

#Set up Plaid API client
# Use production environment if PLAID_ENV is set to 'production', otherwise use sandbox
plaid_env = os.getenv('PLAID_ENV', 'sandbox').lower()
plaid_host = plaid.Environment.Production if plaid_env == 'production' else plaid.Environment.Sandbox

configuration = plaid.Configuration(
    host=plaid_host,
    api_key={
        'clientId': os.getenv('PLAID_CLIENT_ID'), #client id and secret pulled from .env file
        'secret': os.getenv('PLAID_SECRET'),
    }
)

# Apply SSL fix locally for Plaid only (Python 3.13 compatibility)
if sys.version_info >= (3, 13):
    try:
        # Apply SSL fix only for this module to avoid global conflicts
        from ...startup_ssl_fix import apply_startup_ssl_fix
        apply_startup_ssl_fix()
        print("Applied SSL fix for Plaid module")
    except Exception as e:
        print(f"Warning: Could not apply SSL fix for Plaid: {e}")

api_client = plaid.ApiClient(configuration) #handle HTTP requests and responses
client = plaid_api.PlaidApi(api_client) #Call methods on our client.

def check_and_complete_onboarding(user_id):
    """
    Check if all onboarding requirements are met and complete onboarding if so.
    This function acts as our webhook trigger.
    """
    try:
        with get_db_session() as db:
            user = db.query(User).get(user_id)
            if not user:
                return False, "User not found"
            
            # Check if user already completed onboarding
            if user.onboarding_completed:
                return True, "Already completed"
            
            # Check all required fields for onboarding completion
            required_fields_complete = all([
                user.name,
                user.age is not None,
                user.is_student is not None,
                user.financial_goals,
                user.salary_monthly is not None,
                user.monthly_spending_goal is not None,
                user.total_balance is not None,  # This confirms bank connection
                user.plaid_access_token is not None,  # This confirms successful Plaid connection
                (user.college_name if user.is_student else True)
            ])
            
            if required_fields_complete:
                # Mark onboarding as completed
                user.onboarding_completed = True
                user.onboarding_step = 6
                db.commit()
            
                
                current_app.logger.info(f"Onboarding completed for user {user_id}")
                return True, "Onboarding completed successfully"
            else:
                missing_fields = []
                if not user.name: missing_fields.append("name")
                if user.age is None: missing_fields.append("age")
                if user.is_student is None: missing_fields.append("is_student")
                if not user.financial_goals: missing_fields.append("financial_goals")
                if user.salary_monthly is None: missing_fields.append("salary_monthly")
                if user.monthly_spending_goal is None: missing_fields.append("monthly_spending_goal")
                if user.total_balance is None: missing_fields.append("total_balance")
                if not user.plaid_access_token: missing_fields.append("plaid_access_token")
                if user.is_student and not user.college_name: missing_fields.append("college_name")
                
                return False, f"Missing required fields: {', '.join(missing_fields)}"
                
    except Exception as e:
        current_app.logger.error(f"Error checking onboarding completion: {str(e)}")
        return False, str(e)
    
def verify_plaid_webhook_signature(raw_body, headers):
    """
    Verify that the webhook came from Plaid using signature verification
    """
    try:
        # Get the signature from headers
        plaid_signature = headers.get('Plaid-Webhook-Signature')
        if not plaid_signature:
            return False
        
        # Get verification key from Plaid (you'd cache this in production)
        verification_request = WebhookVerificationKeyGetRequest(
            key_id=headers.get('Plaid-Webhook-Key-Id')
        )
        verification_response = client.webhook_verification_key_get(verification_request)
        
        # Verify the signature using the key
        verification_key = verification_response['key']
        
        # Create expected signature
        expected_signature = hmac.new(
            verification_key.encode('utf-8'),
            raw_body,
            hashlib.sha256
        ).hexdigest()
        
        return hmac.compare_digest(plaid_signature, expected_signature)
        
    except Exception as e:
        current_app.logger.error(f"Signature verification error: {str(e)}")
        return False

@plaid_bp.route('/create_link_token', methods=['POST'])
@jwt_required()
def create_link_token():
    try:
        user_id = get_jwt_identity() #get user id from jwt token from frontend
        
        # Log the attempt
        current_app.logger.info(f"Creating Plaid link token for user {user_id}")
        
        # Define webhook URL (adjust this to your deployed backend URL in production)
        webhook_url = current_app.config.get('PLAID_WEBHOOK_URL', 'http://localhost:5001/plaid/webhook')
        
        # Log configuration details (without sensitive data)
        current_app.logger.info(f"Plaid environment: {plaid_env}, Webhook URL: {webhook_url}")
        
        request_obj = LinkTokenCreateRequest( #make request to plaid api to create link token
            products=[Products('transactions')],
            client_name="Polarity", 
            country_codes=[CountryCode('US')],
            language='en',
            webhook=webhook_url,  # Add webhook endpoint to tell plaid where to send notifications
            transactions={
                'days_requested': 90  # Request 90 days of transaction history (default, can be up to 730)
            },
            user=LinkTokenCreateRequestUser(
                client_user_id=user_id
            )
        )
        
        current_app.logger.info("Making Plaid API call to create link token...")
        response = client.link_token_create(request_obj)
        
        # Log successful response
        current_app.logger.info(f"Plaid link token created successfully for user {user_id}")
        current_app.logger.info(f"Link token (first 20 chars): {response.to_dict().get('link_token', 'N/A')[:20]}...")
        
        return jsonify(response.to_dict())
        
    except Exception as e:
        current_app.logger.error(f"Error creating Plaid link token for user {user_id}: {str(e)}")
        current_app.logger.error(f"Exception type: {type(e).__name__}")
        
        # Return a more specific error message
        if "RecursionError" in str(e):
            return jsonify({
                "error": "SSL configuration error. Please contact support.",
                "details": "Internal server error during SSL setup"
            }), 500
        elif "API" in str(e) or "plaid" in str(e).lower():
            return jsonify({
                "error": "Plaid API error. Please check your configuration.",
                "details": str(e)
            }), 500
        else:
            return jsonify({
                "error": "Failed to create link token",
                "details": str(e)
            }), 500

@plaid_bp.route('/exchange_public_token', methods=['POST'])
@jwt_required()
def exchange_public_token():
    user_id = get_jwt_identity()
    data = request.get_json()
    public_token = data.get('public_token')
    
    if not public_token:
        return jsonify({"error": "Missing public_token"}), 400

    try:
        # Exchange the public_token for an access_token
        exchange_request = ItemPublicTokenExchangeRequest(public_token=public_token)
        exchange_response = client.item_public_token_exchange(exchange_request)
        access_token = exchange_response['access_token']
        item_id = exchange_response['item_id']  # Capture the item_id, unique identifier for the user's Plaid account

        # Store access_token and item_id
        with get_db_session() as db:
            user = db.query(User).get(user_id)
            if not user:
                return jsonify({"error": "User not found"}), 404
            
            user.plaid_access_token = access_token
            user.plaid_item_id = item_id  # Store item_id for webhook matching
            
            # Fetch and update balance immediately
            try:
                balance_request = AccountsBalanceGetRequest(access_token=access_token)
                balance_response = client.accounts_balance_get(balance_request)
                accounts = balance_response['accounts']
                
                total_balance = 0
                for acct in accounts:
                    bal = acct['balances'] if isinstance(acct, dict) else acct.balances
                    if 'available' in bal and bal['available'] is not None:
                        total_balance += float(bal['available'])
                    elif 'current' in bal and bal['current'] is not None:
                        total_balance += float(bal['current'])
                
                user.total_balance = total_balance
                db.commit()
                
                # INITIAL TRANSACTION SYNC: Fetch transactions immediately after connecting
                current_app.logger.info(f"Starting initial transaction sync for user {user_id}")
                sync_user_transactions(user_id, access_token) #This will trigger the webhook for transactions
                
                # WEBHOOK TRIGGER: Check if onboarding can be completed
                completion_success, completion_message = check_and_complete_onboarding(user_id)
                
                return jsonify({
                    "access_token": access_token,
                    "item_id": item_id,
                    "total_balance": total_balance,
                    "onboarding_completed": completion_success,
                    "message": completion_message,
                    "transactions_synced": True
                }), 200
                
            except Exception as balance_error:
                current_app.logger.error(f"Error fetching balance: {str(balance_error)}")
                db.commit()  # Still save the access token
                
                return jsonify({
                    "access_token": access_token,
                    "error": "Bank connected but failed to fetch balance",
                    "onboarding_completed": False
                }), 200
                
    except Exception as e:
        current_app.logger.error(f"Plaid exchange_public_token error: {str(e)}")
        return jsonify({"error": "Failed to exchange public token"}), 500

@plaid_bp.route('/update_balance', methods=['POST'])
@jwt_required()
def update_balance():
    user_id = get_jwt_identity()
    data = request.get_json()
    access_token = data.get('access_token')
    
    if not access_token:
        return jsonify({"error": "Missing access_token"}), 400

    try:
        request_obj = AccountsBalanceGetRequest(access_token=access_token)
        response = client.accounts_balance_get(request_obj)
        accounts = response['accounts']

        total_balance = 0
        for acct in accounts:
            bal = acct['balances'] if isinstance(acct, dict) else acct.balances
            if 'available' in bal and bal['available'] is not None:
                total_balance += float(bal['available'])
            elif 'current' in bal and bal['current'] is not None:
                total_balance += float(bal['current'])

        with get_db_session() as db:
            user = db.query(User).get(user_id)
            if not user:
                return jsonify({"error": "User not found"}), 404
            
            user.total_balance = total_balance
            db.commit()
            
            # WEBHOOK TRIGGER: Check if onboarding can be completed
            completion_success, completion_message = check_and_complete_onboarding(user_id)
            
            return jsonify({
                "total_balance": total_balance,
                "onboarding_completed": completion_success,
                "message": completion_message
            }), 200
            
    except Exception as e:
        current_app.logger.error(f"Plaid update_balance error: {str(e)}")
        return jsonify({"error": "Failed to fetch/update balance"}), 500
    
def sync_user_transactions(user_id, access_token):
    """
    Fetch and store transactions from Plaid with automatic gambling detection and intelligent categorization
    """
    try:
        from datetime import datetime, timedelta
        from ..gambling_detection import get_gambling_detection_details, categorize_gambling_transaction
        from ..transaction_categorization import categorize_transaction
        
        # Get transactions from last 90 days
        start_date = (datetime.now() - timedelta(days=90)).date()
        end_date = datetime.now().date()
        
        request_obj = TransactionsGetRequest( #Build request to get transactions from Plaid API 
            access_token=access_token,
            start_date=start_date,
            end_date=end_date
        )
        
        response = client.transactions_get(request_obj) #use client to call Plaid API in right format
        transactions = response['transactions'] 
        total_transactions = response['total_transactions']
        
        current_app.logger.info(f"Fetched {len(transactions)} of {total_transactions} transactions for user {user_id}")
        
        # Debug: Log sample transaction to see what Plaid is returning
        if transactions:
            sample_tx = transactions[0]
            current_app.logger.info(f"Sample Plaid transaction: {sample_tx.get('name')} - Categories: {sample_tx.get('category')} - Merchant: {sample_tx.get('merchant_name')}")
        
        new_transactions = 0
        updated_transactions = 0
        gambling_transactions_detected = 0
        
        with get_db_session() as db:
            # Get user's existing transactions for recurring detection
            existing_user_transactions = db.query(Transaction).filter_by(user_id=user_id).all()
            user_transactions_for_categorization = []
            for tx in existing_user_transactions:
                user_transactions_for_categorization.append({
                    'name': tx.name,
                    'amount': float(tx.amount),
                    'date': tx.date_posted.isoformat()
                })
            
            for plaid_transaction in transactions: #**BUG** Batching or Celery to reduce load times. Syncing 1000+ transactions at once.
                # Check if transaction already exists
                existing = db.query(Transaction).filter_by(
                    plaid_transaction_id=plaid_transaction['transaction_id']
                ).first()
                
                if not existing:
                    # Create new transaction with gambling detection and intelligent categorization
                    # Handle date parsing - Plaid can return either string or date object
                    plaid_date = plaid_transaction['date']
                    if isinstance(plaid_date, str):
                        date_posted = datetime.strptime(plaid_date, '%Y-%m-%d').date()
                    else:
                        # Already a date object
                        date_posted = plaid_date
                    
                    # Perform gambling detection first
                    gambling_detection = get_gambling_detection_details(plaid_transaction)
                    
                    # Determine user category and recurring status
                    if gambling_detection.is_gambling:
                        user_category = categorize_gambling_transaction(plaid_transaction)
                        is_recurring = False  # Gambling transactions are typically not recurring
                        gambling_transactions_detected += 1
                        current_app.logger.info(f"Gambling transaction detected: {plaid_transaction['name']} - {user_category}")
                    else:
                        # Use intelligent categorization for non-gambling transactions
                        categorization_result = categorize_transaction(plaid_transaction, user_transactions_for_categorization)
                        user_category = categorization_result.category
                        is_recurring = categorization_result.is_recurring
                        
                        # Log categorization details for debugging
                        current_app.logger.info(f"Transaction categorized: {plaid_transaction['name']} -> {user_category} (method: {categorization_result.detection_method}, confidence: {categorization_result.confidence:.2f})")
                    
                    transaction = Transaction(
                        user_id=user_id,
                        plaid_transaction_id=plaid_transaction['transaction_id'],
                        date_posted=date_posted,
                        name=plaid_transaction['name'],
                        amount=abs(float(plaid_transaction['amount'])),
                        type='expense' if plaid_transaction['amount'] > 0 else 'income',
                        payment_source=plaid_transaction.get('account_id'),
                        plaid_category=', '.join(plaid_transaction.get('category') or []),
                        user_category=user_category,
                        is_recurring=is_recurring
                    )
                    db.add(transaction)
                    new_transactions += 1
                else:
                    # Update existing transaction with fresh gambling detection and categorization
                    existing.name = plaid_transaction['name']
                    existing.amount = abs(float(plaid_transaction['amount']))
                    existing.plaid_category = ', '.join(plaid_transaction.get('category') or [])
                    
                    # Re-run gambling detection for existing transactions
                    gambling_detection = get_gambling_detection_details(plaid_transaction)
                    if gambling_detection.is_gambling:
                        new_category = categorize_gambling_transaction(plaid_transaction)
                        if existing.user_category != new_category:
                            existing.user_category = new_category
                            existing.is_recurring = False  # Gambling transactions are typically not recurring
                            current_app.logger.info(f"Updated existing transaction category to gambling: {plaid_transaction['name']} - {new_category}")
                    else:
                        # Re-run intelligent categorization for non-gambling transactions
                        categorization_result = categorize_transaction(plaid_transaction, user_transactions_for_categorization)
                        new_category = categorization_result.category
                        new_is_recurring = categorization_result.is_recurring
                        
                        if existing.user_category != new_category or existing.is_recurring != new_is_recurring:
                            existing.user_category = new_category
                            existing.is_recurring = new_is_recurring
                            current_app.logger.info(f"Updated existing transaction: {plaid_transaction['name']} -> {new_category} (recurring: {new_is_recurring})")
                    
                    updated_transactions += 1
            
            db.commit()
            current_app.logger.info(f"Transaction sync completed for user {user_id}: {new_transactions} new, {updated_transactions} updated, {gambling_transactions_detected} gambling transactions detected")
            
    except Exception as e:
        current_app.logger.error(f"Transaction sync error for user {user_id}: {str(e)}")
        # Don't re-raise the exception to prevent breaking the main flow
    
def handle_transactions_webhook(webhook_data):
    """
    Handle transaction-related webhooks
    """
    webhook_code = webhook_data.get('webhook_code')
    item_id = webhook_data.get('item_id')
    
    # Find user by item_id (you'd need to store item_id when user connects)
    with get_db_session() as db:
        user = db.query(User).filter_by(plaid_item_id=item_id).first()
        if not user:
            current_app.logger.error(f"No user found for item_id: {item_id}")
            return
    
    if webhook_code in ['INITIAL_UPDATE', 'HISTORICAL_UPDATE', 'DEFAULT_UPDATE']:
        # Sync transactions for this user
        sync_user_transactions(user.id, user.plaid_access_token)
    # elif webhook_code == 'TRANSACTIONS_REMOVED':
    #     # Handle removed transactions
    #     removed_transactions = webhook_data.get('removed_transactions', [])
    #     remove_transactions_from_db(user.id, removed_transactions)
    else:
        current_app.logger.info(f"Unhandled transaction webhook code: {webhook_code}")

@plaid_bp.route('/webhook', methods=['POST']) #Plaid will send notifications to this endpoint 
def plaid_webhook_data():
    try: 

        raw_data = request.get_data()

        if not verify_plaid_webhook_signature(raw_data, request.headers):
            current_app.logger.warning("Invalid webhook signature")
            return jsonify({"error": "Invalid signature"}), 401

        #Parse JSON data from webhook
        data = request.get_json()
        webhook_type = data.get('webhook_type')
        webhook_code = data.get('webhook_code')
        item_id = data.get('item_id')

        current_app.logger.info(f"Received webhook: {webhook_type} - {webhook_code} for item {item_id}")

        # Handle different webhook types
        if webhook_type == 'TRANSACTIONS': #Accounts for real-time balance updates w/o refresh. ITEM for Handle when users need to re-auth
            handle_transactions_webhook(data)
        else:
            current_app.logger.info(f"Ignoring webhook type: {webhook_type}")
        
        return jsonify({"status": "success"}), 200
    except Exception as e: 
        current_app.logger.error(f"Webhook error: {str(e)}")
        # Still return 200 to prevent Plaid retries for application errors
        return jsonify({"status": "error", "message": str(e)}), 200

    

            


    # webhook_item_id = data.get('item_id')
    # webhook_updated_at = data.get('updated_at')
    # webhook_new_transactions = data.get('new_transactions')
    # webhook_removed_transactions = data.get('removed_transactions')
    # webhook_account_ids = data.get('account_ids')



    


