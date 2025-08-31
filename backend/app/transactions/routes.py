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
from datetime import datetime, date
from sqlalchemy import desc, asc

transactions_bp = Blueprint('transactions', __name__)

@transactions_bp.route('/transactions', methods=['GET'])
@jwt_required()
def get_transactions():
    """
    Get user's transactions with optional filtering, pagination, and sorting
    
    Query Parameters:
    - page (int): Page number (default: 1)
    - per_page (int): Transactions per page (default: 50, max: 100)
    - sort_by (str): Sort field - 'date', 'amount', 'name' (default: 'date')
    - sort_order (str): 'asc' or 'desc' (default: 'desc')
    - type (str): Filter by transaction type - 'income', 'expense'
    - category (str): Filter by user_category
    - search (str): Search in transaction name
    - start_date (str): Filter from date (YYYY-MM-DD)
    - end_date (str): Filter to date (YYYY-MM-DD)
    """
    user_id = get_jwt_identity()
    
    # Get query parameters with defaults
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 50, type=int), 100)  # Cap at 100
    sort_by = request.args.get('sort_by', 'date')
    sort_order = request.args.get('sort_order', 'desc')
    
    # Filter parameters
    transaction_type = request.args.get('type')
    category = request.args.get('category')
    search = request.args.get('search')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    try:
        with get_db_session() as db:
            # Base query for user's transactions
            query = db.query(Transaction).filter_by(user_id=user_id)
            
            # Apply filters
            if transaction_type:
                query = query.filter(Transaction.type == transaction_type)
            
            if category:
                query = query.filter(Transaction.user_category == category)
            
            if search:
                query = query.filter(Transaction.name.ilike(f'%{search}%'))
            
            if start_date:
                try:
                    start_date_obj = datetime.strptime(start_date, '%Y-%m-%d').date()
                    query = query.filter(Transaction.date_posted >= start_date_obj)
                except ValueError:
                    return jsonify({"error": "Invalid start_date format. Use YYYY-MM-DD"}), 400
            
            if end_date:
                try:
                    end_date_obj = datetime.strptime(end_date, '%Y-%m-%d').date()
                    query = query.filter(Transaction.date_posted <= end_date_obj)
                except ValueError:
                    return jsonify({"error": "Invalid end_date format. Use YYYY-MM-DD"}), 400
            
            # Apply sorting
            valid_sort_fields = {
                'date': Transaction.date_posted,
                'amount': Transaction.amount,
                'name': Transaction.name,
                'type': Transaction.type,
                'category': Transaction.user_category
            }
            
            sort_column = valid_sort_fields.get(sort_by, Transaction.date_posted)
            if sort_order == 'asc':
                query = query.order_by(asc(sort_column))
            else:
                query = query.order_by(desc(sort_column))
            
            # Get total count before pagination
            total_transactions = query.count()
            
            # Apply pagination
            transactions = query.offset((page - 1) * per_page).limit(per_page).all()
            
            # Convert to JSON-friendly format
            transactions_data = []
            for transaction in transactions:
                transactions_data.append({
                    'id': transaction.id,
                    'plaid_transaction_id': transaction.plaid_transaction_id,
                    'date_posted': transaction.date_posted.isoformat(),
                    'name': transaction.name,
                    'amount': float(transaction.amount),
                    'type': transaction.type,
                    'payment_source': transaction.payment_source,
                    'plaid_category': transaction.plaid_category,
                    'user_category': transaction.user_category,
                    'is_recurring': transaction.is_recurring,
                    'new_balance_after_transaction': float(transaction.new_balance_after_transaction) if transaction.new_balance_after_transaction else None,
                    'notes': transaction.notes,
                    'created_at': transaction.created_at.isoformat()
                })
            
            # Calculate pagination metadata
            total_pages = (total_transactions + per_page - 1) // per_page
            has_next = page < total_pages
            has_prev = page > 1
            
            return jsonify({
                'transactions': transactions_data,
                'pagination': {
                    'page': page,
                    'per_page': per_page,
                    'total': total_transactions,
                    'total_pages': total_pages,
                    'has_next': has_next,
                    'has_prev': has_prev
                },
                'filters_applied': {
                    'type': transaction_type,
                    'category': category,
                    'search': search,
                    'start_date': start_date,
                    'end_date': end_date,
                    'sort_by': sort_by,
                    'sort_order': sort_order
                }
            }), 200
            
    except Exception as e:
        return jsonify({"error": f"Failed to fetch transactions: {str(e)}"}), 500

@transactions_bp.route('/transactions/categories', methods=['GET'])
@jwt_required()
def get_transaction_categories():
    """
    Get all unique categories used by the user's transactions
    """
    user_id = get_jwt_identity()
    
    try:
        with get_db_session() as db:
            # Get distinct user_categories for this user
            categories = db.query(Transaction.user_category).filter_by(user_id=user_id).distinct().all()
            
            # Extract category names and filter out None/empty
            category_list = [cat[0] for cat in categories if cat[0]]
            category_list.sort()  # Sort alphabetically
            
            return jsonify({
                'categories': category_list,
                'count': len(category_list)
            }), 200
            
    except Exception as e:
        return jsonify({"error": f"Failed to fetch categories: {str(e)}"}), 500

@transactions_bp.route('/transactions/summary', methods=['GET'])
@jwt_required()
def get_transaction_summary():
    """
    Get summary statistics for user's transactions
    """
    user_id = get_jwt_identity()
    
    try:
        with get_db_session() as db:
            # Get all transactions for user
            transactions = db.query(Transaction).filter_by(user_id=user_id).all()
            
            if not transactions:
                return jsonify({
                    'total_transactions': 0,
                    'total_income': 0,
                    'total_expenses': 0,
                    'net_amount': 0,
                    'by_category': {},
                    'by_month': {}
                }), 200
            
            # Calculate summary statistics
            total_income = sum(float(t.amount) for t in transactions if t.type == 'income')
            total_expenses = sum(float(t.amount) for t in transactions if t.type == 'expense')
            net_amount = total_income - total_expenses
            
            # Group by category
            category_summary = {}
            for transaction in transactions:
                category = transaction.user_category or 'Uncategorized'
                if category not in category_summary:
                    category_summary[category] = {'income': 0, 'expense': 0, 'count': 0}
                
                if transaction.type == 'income':
                    category_summary[category]['income'] += float(transaction.amount)
                else:
                    category_summary[category]['expense'] += float(transaction.amount)
                category_summary[category]['count'] += 1
            
            # Group by month
            month_summary = {}
            for transaction in transactions:
                month_key = transaction.date_posted.strftime('%Y-%m')
                if month_key not in month_summary:
                    month_summary[month_key] = {'income': 0, 'expense': 0, 'count': 0}
                
                if transaction.type == 'income':
                    month_summary[month_key]['income'] += float(transaction.amount)
                else:
                    month_summary[month_key]['expense'] += float(transaction.amount)
                month_summary[month_key]['count'] += 1
            
            return jsonify({
                'total_transactions': len(transactions),
                'total_income': total_income,
                'total_expenses': total_expenses,
                'net_amount': net_amount,
                'by_category': category_summary,
                'by_month': month_summary
            }), 200
            
    except Exception as e:
        return jsonify({"error": f"Failed to fetch summary: {str(e)}"}), 500