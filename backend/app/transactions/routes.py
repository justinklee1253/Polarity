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

@transactions_bp.route('/transactions/gambling-spend', methods=['GET'])
@jwt_required()
def get_gambling_spend():
    """
    Calculate total gambling and sports betting spending for the user using enhanced detection
    """
    user_id = get_jwt_identity()
    
    try:
        with get_db_session() as db:
            from datetime import datetime, timedelta
            from sqlalchemy import func, or_
            from ..gambling_detection import GamblingDetector
            
            # Use the same gambling categories as our detection module
            detector = GamblingDetector() #instance of GamblingDetector class to access methods
            gambling_categories = detector.GAMBLING_CATEGORIES
            
            # Get current month gambling spending
            current_date = datetime.now()
            current_month = current_date.month
            current_year = current_date.year
            
            # Query for gambling transactions in current month using user_category
            # (which is now automatically set by our gambling detection during sync)
            gambling_query = db.query(Transaction).filter(
                Transaction.user_id == user_id, 
                Transaction.type == 'expense',
                func.extract('month', Transaction.date_posted) == current_month,
                func.extract('year', Transaction.date_posted) == current_year
            ).filter(
                or_(
                    # Match by user_category (set by gambling detection)
                    Transaction.user_category.in_(gambling_categories),
                    # Fallback: match by plaid_category for legacy transactions
                    Transaction.plaid_category.in_(gambling_categories)
                )
            )
            
            gambling_transactions = gambling_query.all()
            current_month_gambling = sum(float(t.amount) for t in gambling_transactions)
            
            # Get last 90 days gambling spending for trend analysis
            ninety_days_ago = current_date - timedelta(days=90)
            gambling_90_days = db.query(Transaction).filter(
                Transaction.user_id == user_id,
                Transaction.type == 'expense',
                Transaction.date_posted >= ninety_days_ago
            ).filter(
                or_(
                    Transaction.user_category.in_(gambling_categories),
                    Transaction.plaid_category.in_(gambling_categories)
                )
            ).all()
            
            total_90_days_gambling = sum(float(t.amount) for t in gambling_90_days)
            
            # Calculate daily average
            days_in_month = current_date.day
            daily_average = current_month_gambling / days_in_month if days_in_month > 0 else 0
            
            # Get sample gambling transactions for transparency
            sample_transactions = []
            for t in gambling_transactions[:5]:  # Show first 5
                sample_transactions.append({
                    'name': t.name,
                    'amount': float(t.amount),
                    'date': t.date_posted.isoformat(),
                    'category': t.user_category or t.plaid_category,
                    'detection_method': 'automatic_during_sync' if t.user_category in gambling_categories else 'legacy_plaid_category'
                })
            
            # Calculate spending by category breakdown
            category_breakdown = {}
            for t in gambling_transactions:
                category = t.user_category or t.plaid_category or 'Unknown'
                if category not in category_breakdown:
                    category_breakdown[category] = {'amount': 0, 'count': 0}
                category_breakdown[category]['amount'] += float(t.amount)
                category_breakdown[category]['count'] += 1
            
            return jsonify({
                'current_month_gambling': round(current_month_gambling, 2),
                'total_90_days_gambling': round(total_90_days_gambling, 2),
                'daily_average': round(daily_average, 2),
                'gambling_transactions_count': len(gambling_transactions),
                'current_month': current_month,
                'current_year': current_year,
                'sample_transactions': sample_transactions,
                'category_breakdown': category_breakdown,
                'detection_method': 'enhanced_automatic_detection',
                'detection_features': {
                    'merchant_matching': True,
                    'keyword_matching': True,
                    'plaid_category_matching': True,
                    'confidence_scoring': True
                }
            }), 200
            
    except Exception as e:
        current_app.logger.error(f"Error calculating gambling spend for user {user_id}: {str(e)}")
        return jsonify({"error": f"Failed to calculate gambling spend: {str(e)}"}), 500

@transactions_bp.route('/transactions/spending-over-time', methods=['GET'])
@jwt_required()
def get_spending_over_time():
    """
    Get spending data over the last 90 days for chart visualization using enhanced gambling detection
    Returns daily totals for both total spending and gambling spending
    """
    user_id = get_jwt_identity()
    
    try:
        with get_db_session() as db:
            from datetime import datetime, timedelta
            from sqlalchemy import func, or_, and_
            from collections import defaultdict
            from ..gambling_detection import GamblingDetector
            
            # Use the same gambling categories as our detection module
            detector = GamblingDetector()
            gambling_categories = detector.GAMBLING_CATEGORIES
            
            # Get last 90 days of data
            end_date = datetime.now().date()
            start_date = end_date - timedelta(days=90)
            
            # Get all expense transactions in the last 90 days
            all_expenses = db.query(Transaction).filter(
                Transaction.user_id == user_id,
                Transaction.type == 'expense',
                Transaction.date_posted >= start_date,
                Transaction.date_posted <= end_date
            ).all()
            
            # Get gambling transactions in the last 90 days using enhanced detection
            gambling_expenses = db.query(Transaction).filter(
                Transaction.user_id == user_id,
                Transaction.type == 'expense',
                Transaction.date_posted >= start_date,
                Transaction.date_posted <= end_date
            ).filter(
                or_(
                    # Match by user_category (set by gambling detection)
                    Transaction.user_category.in_(gambling_categories),
                    # Fallback: match by plaid_category for legacy transactions
                    Transaction.plaid_category.in_(gambling_categories)
                )
            ).all()
            
            # Group by date
            daily_totals = defaultdict(lambda: {'total': 0, 'gambling': 0})
            
            # Process all expenses
            for transaction in all_expenses:
                date_key = transaction.date_posted.isoformat()
                daily_totals[date_key]['total'] += float(transaction.amount)
            
            # Process gambling expenses
            for transaction in gambling_expenses:
                date_key = transaction.date_posted.isoformat()
                daily_totals[date_key]['gambling'] += float(transaction.amount)
            
            # Convert to list format and fill missing dates with zeros
            chart_data = []
            current_date = start_date
            while current_date <= end_date:
                date_key = current_date.isoformat()
                chart_data.append({
                    'date': date_key,
                    'total_spending': round(daily_totals[date_key]['total'], 2),
                    'gambling_spending': round(daily_totals[date_key]['gambling'], 2)
                })
                current_date += timedelta(days=1)
            
            # Calculate summary statistics
            total_spending_90_days = sum(day['total_spending'] for day in chart_data)
            total_gambling_90_days = sum(day['gambling_spending'] for day in chart_data)
            
            # Calculate percentage increase/decrease (compare first 30 days vs last 30 days)
            first_30_days_gambling = sum(day['gambling_spending'] for day in chart_data[:30])
            last_30_days_gambling = sum(day['gambling_spending'] for day in chart_data[-30:])
            
            gambling_trend_percentage = 0
            if first_30_days_gambling > 0:
                gambling_trend_percentage = round(
                    ((last_30_days_gambling - first_30_days_gambling) / first_30_days_gambling) * 100, 1
                )
            
            # Calculate gambling spending by category for the 90-day period
            gambling_by_category = defaultdict(lambda: {'amount': 0, 'count': 0})
            for transaction in gambling_expenses:
                category = transaction.user_category or transaction.plaid_category or 'Unknown'
                gambling_by_category[category]['amount'] += float(transaction.amount)
                gambling_by_category[category]['count'] += 1
            
            return jsonify({
                'chart_data': chart_data,
                'summary': {
                    'total_spending_90_days': round(total_spending_90_days, 2),
                    'total_gambling_90_days': round(total_gambling_90_days, 2),
                    'gambling_trend_percentage': gambling_trend_percentage,
                    'gambling_percentage_of_total': round(
                        (total_gambling_90_days / total_spending_90_days * 100) if total_spending_90_days > 0 else 0, 1
                    ),
                    'gambling_by_category': dict(gambling_by_category)
                },
                'date_range': {
                    'start_date': start_date.isoformat(),
                    'end_date': end_date.isoformat(),
                    'days': 90
                },
                'detection_method': 'enhanced_automatic_detection'
            }), 200
            
    except Exception as e:
        current_app.logger.error(f"Error getting spending over time for user {user_id}: {str(e)}")
        return jsonify({"error": f"Failed to get spending over time: {str(e)}"}), 500

@transactions_bp.route('/transactions/gambling-alerts', methods=['GET'])
@jwt_required()
def get_gambling_alerts():
    """
    Get gambling spending alerts and recommendations based on user's spending patterns
    """
    user_id = get_jwt_identity()
    
    try:
        with get_db_session() as db:
            from datetime import datetime, timedelta
            from sqlalchemy import func, or_
            from ..gambling_detection import GamblingDetector
            
            # Use the same gambling categories as our detection module
            detector = GamblingDetector()
            gambling_categories = detector.GAMBLING_CATEGORIES
            
            current_date = datetime.now()
            current_month = current_date.month
            current_year = current_date.year
            
            # Get current month gambling spending
            current_month_gambling = db.query(
                func.sum(Transaction.amount).label('total_gambling')
            ).filter(
                Transaction.user_id == user_id,
                Transaction.type == 'expense',
                func.extract('month', Transaction.date_posted) == current_month,
                func.extract('year', Transaction.date_posted) == current_year,
                or_(
                    Transaction.user_category.in_(gambling_categories),
                    Transaction.plaid_category.in_(gambling_categories)
                )
            ).scalar()
            
            current_month_gambling = float(current_month_gambling) if current_month_gambling else 0
            
            # Get last 3 months for trend analysis
            three_months_ago = current_date - timedelta(days=90)
            last_3_months_gambling = db.query(
                func.sum(Transaction.amount).label('total_gambling')
            ).filter(
                Transaction.user_id == user_id,
                Transaction.type == 'expense',
                Transaction.date_posted >= three_months_ago,
                or_(
                    Transaction.user_category.in_(gambling_categories),
                    Transaction.plaid_category.in_(gambling_categories)
                )
            ).scalar()
            
            last_3_months_gambling = float(last_3_months_gambling) if last_3_months_gambling else 0
            
            # Calculate monthly average
            monthly_average = last_3_months_gambling / 3 if last_3_months_gambling > 0 else 0
            
            # Define spending thresholds (can be made configurable per user)
            LOW_THRESHOLD = 50    # $50/month
            MEDIUM_THRESHOLD = 200  # $200/month
            HIGH_THRESHOLD = 500    # $500/month
            
            # Generate alerts and recommendations
            alerts = []
            recommendations = []
            
            # Current month spending alert
            if current_month_gambling > HIGH_THRESHOLD:
                alerts.append({
                    'type': 'high_spending',
                    'severity': 'high',
                    'message': f'You\'ve spent ${current_month_gambling:.2f} on gambling this month, which is above the high threshold of ${HIGH_THRESHOLD}',
                    'amount': current_month_gambling,
                    'threshold': HIGH_THRESHOLD
                })
                recommendations.append({
                    'type': 'spending_reduction',
                    'message': f'Consider setting a monthly gambling budget of ${MEDIUM_THRESHOLD} or less',
                    'suggested_amount': MEDIUM_THRESHOLD
                })
            elif current_month_gambling > MEDIUM_THRESHOLD:
                alerts.append({
                    'type': 'medium_spending',
                    'severity': 'medium',
                    'message': f'You\'ve spent ${current_month_gambling:.2f} on gambling this month',
                    'amount': current_month_gambling,
                    'threshold': MEDIUM_THRESHOLD
                })
                recommendations.append({
                    'type': 'budget_awareness',
                    'message': 'Consider tracking your gambling spending more closely',
                    'suggested_amount': LOW_THRESHOLD
                })
            elif current_month_gambling > LOW_THRESHOLD:
                alerts.append({
                    'type': 'low_spending',
                    'severity': 'low',
                    'message': f'You\'ve spent ${current_month_gambling:.2f} on gambling this month',
                    'amount': current_month_gambling,
                    'threshold': LOW_THRESHOLD
                })
            
            # Trend analysis
            if monthly_average > 0:
                trend_percentage = ((current_month_gambling - monthly_average) / monthly_average) * 100
                
                if trend_percentage > 50:  # 50% increase
                    alerts.append({
                        'type': 'spending_increase',
                        'severity': 'medium',
                        'message': f'Your gambling spending is {trend_percentage:.1f}% higher than your 3-month average',
                        'trend_percentage': trend_percentage,
                        'current_amount': current_month_gambling,
                        'average_amount': monthly_average
                    })
                    recommendations.append({
                        'type': 'trend_awareness',
                        'message': 'Consider reviewing your recent gambling activity and setting limits',
                        'suggested_amount': monthly_average
                    })
                elif trend_percentage < -30:  # 30% decrease
                    recommendations.append({
                        'type': 'positive_trend',
                        'message': f'Great job! Your gambling spending is down {abs(trend_percentage):.1f}% from your average',
                        'trend_percentage': trend_percentage
                    })
            
            # Frequency analysis
            gambling_transaction_count = db.query(Transaction).filter(
                Transaction.user_id == user_id,
                Transaction.type == 'expense',
                func.extract('month', Transaction.date_posted) == current_month,
                func.extract('year', Transaction.date_posted) == current_year,
                or_(
                    Transaction.user_category.in_(gambling_categories),
                    Transaction.plaid_category.in_(gambling_categories)
                )
            ).count()
            
            if gambling_transaction_count > 20:  # More than 20 gambling transactions per month
                alerts.append({
                    'type': 'high_frequency',
                    'severity': 'medium',
                    'message': f'You\'ve made {gambling_transaction_count} gambling transactions this month',
                    'transaction_count': gambling_transaction_count
                })
                recommendations.append({
                    'type': 'frequency_reduction',
                    'message': 'Consider reducing the frequency of your gambling activities',
                    'suggested_frequency': 'Less than 15 transactions per month'
                })
            
            # Calculate gambling percentage of total spending
            total_monthly_spending = db.query(
                func.sum(Transaction.amount).label('total_spending')
            ).filter(
                Transaction.user_id == user_id,
                Transaction.type == 'expense',
                func.extract('month', Transaction.date_posted) == current_month,
                func.extract('year', Transaction.date_posted) == current_year
            ).scalar()
            
            total_monthly_spending = float(total_monthly_spending) if total_monthly_spending else 0
            gambling_percentage = (current_month_gambling / total_monthly_spending * 100) if total_monthly_spending > 0 else 0
            
            if gambling_percentage > 20:  # More than 20% of total spending
                alerts.append({
                    'type': 'high_percentage',
                    'severity': 'high',
                    'message': f'Gambling represents {gambling_percentage:.1f}% of your total spending this month',
                    'percentage': gambling_percentage,
                    'gambling_amount': current_month_gambling,
                    'total_spending': total_monthly_spending
                })
                recommendations.append({
                    'type': 'spending_balance',
                    'message': 'Consider diversifying your spending and reducing gambling expenses',
                    'suggested_percentage': 10
                })
            
            return jsonify({
                'alerts': alerts,
                'recommendations': recommendations,
                'current_month_summary': {
                    'gambling_spending': round(current_month_gambling, 2),
                    'gambling_transactions': gambling_transaction_count,
                    'gambling_percentage_of_total': round(gambling_percentage, 1),
                    'monthly_average_3_months': round(monthly_average, 2)
                },
                'thresholds': {
                    'low': LOW_THRESHOLD,
                    'medium': MEDIUM_THRESHOLD,
                    'high': HIGH_THRESHOLD
                },
                'detection_method': 'enhanced_automatic_detection'
            }), 200
            
    except Exception as e:
        current_app.logger.error(f"Error getting gambling alerts for user {user_id}: {str(e)}")
        return jsonify({"error": f"Failed to get gambling alerts: {str(e)}"}), 500

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

@transactions_bp.route('/transactions/recategorize', methods=['POST'])
@jwt_required()
def recategorize_transactions():
    """
    Manually recategorize all user transactions using the new intelligent categorization system
    This is useful for updating existing transactions with better categories. 
    """
    user_id = get_jwt_identity()
    
    try:
        with get_db_session() as db:
            # Get all user transactions
            transactions = db.query(Transaction).filter_by(user_id=user_id).all()
            
            if not transactions:
                return jsonify({"message": "No transactions found to recategorize"}), 200
            
            # Import categorization functions
            from app.gambling_detection import get_gambling_detection_details, categorize_gambling_transaction
            from app.transaction_categorization import categorize_transaction
            
            # Prepare transaction data for categorization
            user_transactions_for_categorization = []
            for tx in transactions:
                user_transactions_for_categorization.append({
                    'name': tx.name,
                    'amount': float(tx.amount),
                    'date': tx.date_posted.isoformat()
                })
            
            recategorized_count = 0
            gambling_updated_count = 0
            
            for transaction in transactions:
                # Create a plaid-like transaction object for categorization
                plaid_like_transaction = {
                    'name': transaction.name,
                    'amount': float(transaction.amount),
                    'merchant_name': None,  # Not available in our current data
                    'category': transaction.plaid_category.split(', ') if transaction.plaid_category else []
                }
                
                # Perform gambling detection first
                gambling_detection = get_gambling_detection_details(plaid_like_transaction)
                
                old_category = transaction.user_category
                old_recurring = transaction.is_recurring
                
                if gambling_detection.is_gambling:
                    new_category = categorize_gambling_transaction(plaid_like_transaction)
                    new_recurring = False  # Gambling transactions are typically not recurring
                    gambling_updated_count += 1
                else:
                    # Use intelligent categorization for non-gambling transactions
                    categorization_result = categorize_transaction(plaid_like_transaction, user_transactions_for_categorization)
                    new_category = categorization_result.category
                    new_recurring = categorization_result.is_recurring
                
                # Update if category or recurring status changed
                if old_category != new_category or old_recurring != new_recurring:
                    transaction.user_category = new_category
                    transaction.is_recurring = new_recurring
                    recategorized_count += 1
                    
                    current_app.logger.info(f"Recategorized transaction {transaction.id}: '{transaction.name}' from '{old_category}' to '{new_category}' (recurring: {old_recurring} -> {new_recurring})")
            
            db.commit()
            
            return jsonify({
                "message": f"Recategorization completed successfully",
                "total_transactions": len(transactions),
                "recategorized_count": recategorized_count,
                "gambling_updated_count": gambling_updated_count,
                "user_id": user_id
            }), 200
            
    except Exception as e:
        current_app.logger.error(f"Error recategorizing transactions for user {user_id}: {str(e)}")
        return jsonify({"error": f"Failed to recategorize transactions: {str(e)}"}), 500