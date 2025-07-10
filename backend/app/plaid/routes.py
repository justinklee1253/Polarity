import os
import plaid
from plaid.api import plaid_api
from plaid.model.link_token_create_request import LinkTokenCreateRequest
from plaid.model.link_token_create_request_user import LinkTokenCreateRequestUser
from plaid.model.products import Products
from plaid.model.country_code import CountryCode

from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import get_jwt, jwt_required, get_jwt_identity


plaid_bp = Blueprint('plaid', __name__, url_prefix='/plaid')

configuration = plaid.Configuration(
    host=plaid.Environment.Sandbox,
    api_key={
        'clientId': os.getenv('PLAID_CLIENT_ID'), 
        'secret': os.getenv('PLAID_SECRET'),
    }
)
api_client = plaid.ApiClient(configuration)
client = plaid_api.PlaidApi(api_client)


#on backend we want to request a link token which we will pass from backend --> frontend


@plaid_bp.route('/create_link_token', methods=['POST'])
@jwt_required()
def create_link_token():
    user_id = get_jwt_identity()
    request = LinkTokenCreateRequest(
        products=[Products('transactions')],
        client_name="Polarity",
        country_codes=[CountryCode('US')],
        language='en',
        user=LinkTokenCreateRequestUser(
            client_user_id=user_id
        )
    
    )
    response=client.link_token_create(request)
    return jsonify(response.to_dict())
    