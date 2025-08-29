import os
import plaid
from plaid.api import plaid_api
from plaid.model.link_token_create_request import LinkTokenCreateRequest
from plaid.model.link_token_create_request_user import LinkTokenCreateRequestUser
from plaid.model.products import Products
from plaid.model.country_code import CountryCode
from plaid.model.accounts_balance_get_request import AccountsBalanceGetRequest
from plaid.model.item_public_token_exchange_request import ItemPublicTokenExchangeRequest

from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import get_jwt, jwt_required, get_jwt_identity
from flask_socketio import SocketIO, emit

from ..database import get_db_session
from ..models import User
import json

plaid_bp = Blueprint('plaid', __name__, url_prefix='/plaid')

# Initialize SocketIO (assuming you have it set up in your main app)
# socketio = SocketIO(cors_allowed_origins="*")

#Set up Plaid API client
configuration = plaid.Configuration(
    host=plaid.Environment.Sandbox, #set to sandbox testing env for dev, real app uses plaid.Environment.Production
    api_key={
        'clientId': os.getenv('PLAID_CLIENT_ID'), #client id and secret pulled from .env file
        'secret': os.getenv('PLAID_SECRET'),
    }
)
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

@plaid_bp.route('/create_link_token', methods=['POST'])
@jwt_required()
def create_link_token():
    user_id = get_jwt_identity() #get user id from jwt token from frontend
    request_obj = LinkTokenCreateRequest( #make request to plaid api to create link token
        products=[Products('transactions')],
        client_name="Polarity",
        country_codes=[CountryCode('US')],
        language='en',
        user=LinkTokenCreateRequestUser(
            client_user_id=user_id
        )
    )
    response = client.link_token_create(request_obj)

    # # Debug: Print the response to console
    # print("=== PLAID LINK TOKEN RESPONSE ===")
    # print(f"Type: {type(response)}")
    # print(f"Response object: {response}")
    # print(f"Response dict: {response.to_dict()}")
    # print(f"Link token (first 20 chars): {response.to_dict().get('link_token', 'N/A')[:20]}...")
    # print(f"Expiration: {response.to_dict().get('expiration', 'N/A')}")
    # print(f"Request ID: {response.to_dict().get('request_id', 'N/A')}")
    # print("================================")
    
    # Also log it properly
    current_app.logger.info(f"Plaid link token response: {response.to_dict()}")
    
    return jsonify(response.to_dict())

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

        # Store access_token and fetch initial balance
        with get_db_session() as db:
            user = db.query(User).get(user_id)
            if not user:
                return jsonify({"error": "User not found"}), 404
            
            user.plaid_access_token = access_token
            
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
                
                # WEBHOOK TRIGGER: Check if onboarding can be completed
                completion_success, completion_message = check_and_complete_onboarding(user_id)
                
                return jsonify({
                    "access_token": access_token,
                    "total_balance": total_balance,
                    "onboarding_completed": completion_success,
                    "message": completion_message
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