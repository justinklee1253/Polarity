"""
   # Missing endpoints:
   - GET /transactions - Fetch user's transactions from DB
   - POST /transactions/sync - Sync latest transactions from Plaid
   - PUT /transactions/{id} - Update transaction categories/notes

"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import User, Transaction
from app.database import get_db_session

transactions_bp = Blueprint('transactions', __name__)

@transactions_bp.route('/transactions', methods=['GET'])
@jwt_required()
def get_transactions(): 
    pass