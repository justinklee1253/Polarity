"""
   Transaction Routes - Complete API endpoints for transaction management:
   
   ✅ GET /transactions - Fetch user's transactions from DB (with pagination, filtering, sorting)
   ✅ GET /transactions/categories - Get unique user categories  
   ✅ GET /transactions/summary - Get transaction summary statistics
   ✅ PUT /transactions/{id} - Update transaction categories/notes/recurring status
   ✅ POST /transactions/sync - Manually sync latest transactions from Plaid
"""

from flask import Blueprint, request, jsonify, current_app
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

@transactions_bp.route('/transactions/<int:transaction_id>', methods=['PUT'])
@jwt_required()
def update_transaction_details(transaction_id):
    """
    Update a transaction's category, notes, or other editable fields
    """
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    try:
        with get_db_session() as db:
            # Find the transaction and verify it belongs to the user
            transaction = db.query(Transaction).filter_by(
                id=transaction_id, 
                user_id=user_id
            ).first()
            
            if not transaction:
                return jsonify({"error": "Transaction not found"}), 404
            
            # Update allowed fields
            if 'user_category' in data:
                transaction.user_category = data['user_category']
            
            if 'notes' in data:
                transaction.notes = data['notes']
            
            if 'is_recurring' in data:
                transaction.is_recurring = bool(data['is_recurring'])
            
            db.commit()
            
            return jsonify({
                "message": "Transaction updated successfully",
                "transaction": {
                    'id': transaction.id,
                    'user_category': transaction.user_category,
                    'notes': transaction.notes,
                    'is_recurring': transaction.is_recurring
                }
            }), 200
            
    except Exception as e:
        current_app.logger.error(f"Error updating transaction {transaction_id}: {str(e)}")
        return jsonify({"error": f"Failed to update transaction: {str(e)}"}), 500

@transactions_bp.route('/transactions/monthly-income', methods=['GET'])
@jwt_required()
def get_monthly_income():
    """
    Calculate monthly income based on actual income transactions
    Returns the sum of all income transactions in the current month
    """
    user_id = get_jwt_identity()
    
    try:
        with get_db_session() as db:
            from datetime import datetime
            from sqlalchemy import func, extract
            
            # Get current month and year
            current_date = datetime.now()
            current_month = current_date.month
            current_year = current_date.year
            
            # Get all income transactions for current month
            current_month_income = db.query(
                func.sum(Transaction.amount).label('total_income')
            ).filter(
                Transaction.user_id == user_id,
                Transaction.type == 'income',
                extract('month', Transaction.date_posted) == current_month,
                extract('year', Transaction.date_posted) == current_year
            ).scalar()
            
            monthly_income = float(current_month_income) if current_month_income else 0
            
            # Also get count of income transactions for transparency
            income_count = db.query(Transaction).filter(
                Transaction.user_id == user_id,
                Transaction.type == 'income',
                extract('month', Transaction.date_posted) == current_month,
                extract('year', Transaction.date_posted) == current_year
            ).count()
            
            # Get sample income transactions for debugging
            sample_transactions = db.query(Transaction).filter(
                Transaction.user_id == user_id,
                Transaction.type == 'income',
                extract('month', Transaction.date_posted) == current_month,
                extract('year', Transaction.date_posted) == current_year
            ).limit(5).all()
            
            sample_data = []
            for t in sample_transactions:
                sample_data.append({
                    'name': t.name,
                    'amount': float(t.amount),
                    'date': t.date_posted.isoformat(),
                    'category': t.plaid_category
                })
            
            return jsonify({
                'monthly_income': round(monthly_income, 2),
                'income_transactions_count': income_count,
                'current_month': current_month,
                'current_year': current_year,
                'sample_transactions': sample_data,
                'calculation_method': 'current_month_sum'
            }), 200
            
    except Exception as e:
        current_app.logger.error(f"Error calculating monthly income for user {user_id}: {str(e)}")
        return jsonify({"error": f"Failed to calculate monthly income: {str(e)}"}), 500

@transactions_bp.route('/transactions/sync', methods=['POST'])
@jwt_required()
def sync_transactions_manual():
    """
    Manually trigger a transaction sync from Plaid
    """
    user_id = get_jwt_identity()
    
    try:
        with get_db_session() as db:
            user = db.query(User).get(user_id)
            if not user:
                return jsonify({"error": "User not found"}), 404
            
            if not user.plaid_access_token:
                return jsonify({"error": "No Plaid account connected"}), 400
            
            # Import the sync function from plaid routes
            from app.plaid.routes import sync_user_transactions
            
            # Trigger sync
            current_app.logger.info(f"Manual transaction sync requested for user {user_id}")
            sync_user_transactions(user_id, user.plaid_access_token)
            
            return jsonify({
                "message": "Transaction sync completed successfully",
                "user_id": user_id
            }), 200
            
    except Exception as e:
        current_app.logger.error(f"Error syncing transactions for user {user_id}: {str(e)}")
        return jsonify({"error": f"Failed to sync transactions: {str(e)}"}), 500