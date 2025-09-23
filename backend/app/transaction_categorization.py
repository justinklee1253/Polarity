"""
Transaction Categorization Module

This module provides intelligent transaction categorization for Plaid transactions,
including fallback categorization when Plaid categories are not available (common in sandbox mode).

Features:
- Merchant name-based categorization
- Transaction amount pattern analysis
- Recurring transaction detection
- Fallback categorization for unknown transactions
"""

import re
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass
from datetime import datetime, timedelta
from collections import defaultdict


@dataclass
class CategorizationResult:
    """Result of transaction categorization analysis"""
    category: str
    confidence: float  # 0.0 to 1.0
    is_recurring: bool
    detection_method: str  # 'plaid_category', 'merchant_match', 'amount_pattern', 'fallback'
    reasoning: str


class TransactionCategorizer:
    """
    Main class for categorizing transactions when Plaid categories are not available
    """
    
    # Merchant name patterns for common categories
    MERCHANT_CATEGORIES = {
        'Food & Dining': [
            r'mcdonald', r'burger king', r'wendy', r'taco bell', r'kfc', r'subway',
            r'pizza hut', r'domino', r'chipotle', r'panera', r'starbucks', r'dunkin',
            r'cafe', r'restaurant', r'diner', r'grill', r'bistro', r'kitchen',
            r'food', r'eat', r'dining', r'meal', r'lunch', r'dinner', r'breakfast'
        ],
        'Transportation': [
            r'uber', r'lyft', r'taxi', r'bus', r'train', r'metro', r'subway',
            r'gas', r'fuel', r'shell', r'exxon', r'bp', r'chevron', r'mobil',
            r'parking', r'garage', r'valet', r'toll', r'ezpass', r'fastrak',
            r'trip', r'ride', r'car service', r'limo', r'airport', r'oil'
        ],
        'Shopping': [
            r'amazon', r'walmart', r'target', r'costco', r'best buy', r'home depot',
            r'lowes', r'macy', r'nordstrom', r'gap', r'old navy', r'zara',
            r'h&m', r'uniqlo', r'forever 21', r'urban outfitters', r'sephora',
            r'ulta', r'cvs', r'walgreens', r'rite aid', r'pharmacy'
        ],
        'Entertainment': [
            r'netflix', r'spotify', r'hulu', r'disney', r'prime video', r'hbo',
            r'youtube', r'twitch', r'steam', r'playstation', r'xbox', r'nintendo',
            r'movie', r'cinema', r'theater', r'concert', r'event', r'ticket',
            r'game', r'gaming', r'arcade', r'bowling', r'pool', r'mini golf'
        ],
        'Healthcare': [
            r'hospital', r'clinic', r'doctor', r'medical', r'health', r'pharmacy',
            r'dental', r'vision', r'optometrist', r'orthodontist', r'urgent care',
            r'emergency', r'ambulance', r'prescription', r'medication', r'lab',
            r'x-ray', r'mri', r'ct scan', r'blood test', r'vaccine'
        ],
        'Utilities': [
            r'electric', r'gas', r'water', r'sewer', r'trash', r'garbage',
            r'internet', r'cable', r'phone', r'cellular', r'verizon', r'at&t',
            r't-mobile', r'sprint', r'comcast', r'xfinity', r'charter', r'spectrum'
        ],
        'Insurance': [
            r'insurance', r'auto insurance', r'home insurance', r'health insurance',
            r'life insurance', r'disability', r'geico', r'state farm', r'progressive',
            r'allstate', r'farmers', r'liberty mutual', r'usaa', r'aaa'
        ],
        'Education': [
            r'school', r'university', r'college', r'tuition', r'education',
            r'student loan', r'textbook', r'course', r'class', r'learning',
            r'khan academy', r'coursera', r'udemy', r'skillshare', r'masterclass'
        ],
        'Personal Care': [
            r'gym', r'fitness', r'yoga', r'pilates', r'crossfit', r'personal trainer',
            r'spa', r'massage', r'nail', r'hair', r'barber', r'salon', r'beauty',
            r'cosmetic', r'skincare', r'makeup', r'perfume', r'fragrance'
        ],
        'Travel': [
            r'hotel', r'motel', r'airbnb', r'booking', r'expedia', r'priceline',
            r'airline', r'flight', r'airport', r'rental car', r'hertz', r'avis',
            r'enterprise', r'national', r'budget', r'cruise', r'vacation', r'trip'
        ],
        'Financial Services': [
            r'bank', r'credit union', r'atm', r'withdrawal', r'deposit', r'transfer',
            r'loan', r'mortgage', r'credit card', r'payment', r'fee', r'interest',
            r'investment', r'brokerage', r'fidelity', r'schwab', r'vanguard',
            r'robinhood', r'paypal', r'venmo', r'zelle', r'cash app'
        ],
        'Income': [
            r'salary', r'payroll', r'wage', r'bonus', r'commission', r'tip',
            r'income', r'deposit', r'direct deposit', r'paycheck', r'stipend',
            r'pension', r'social security', r'unemployment', r'disability',
            r'refund', r'rebate', r'cashback', r'reward'
        ]
    }
    
    # Amount patterns for recurring detection
    RECURRING_AMOUNT_TOLERANCE = 0.05  # 5% tolerance for recurring amounts
    
    def __init__(self):
        """Initialize the categorizer with compiled regex patterns"""
        self.merchant_patterns = {}
        for category, patterns in self.MERCHANT_CATEGORIES.items():
            self.merchant_patterns[category] = [
                re.compile(pattern, re.IGNORECASE) for pattern in patterns
            ]
    
    def categorize_by_merchant(self, transaction_name: str, merchant_name: Optional[str] = None) -> Tuple[str, float]:
        """
        Categorize transaction based on merchant name patterns
        
        Args:
            transaction_name: The transaction name from Plaid
            merchant_name: Optional merchant name from Plaid
            
        Returns:
            Tuple of (category, confidence)
        """
        text_to_check = [transaction_name]
        if merchant_name:
            text_to_check.append(merchant_name)
        
        best_category = 'Other'
        best_confidence = 0.0
        
        for text in text_to_check:
            if not text:
                continue
                
            normalized_text = text.lower().strip()
            
            for category, patterns in self.merchant_patterns.items():
                for pattern in patterns:
                    if pattern.search(normalized_text):
                        # Calculate confidence based on pattern specificity
                        confidence = 0.8 if len(pattern.pattern) > 5 else 0.6
                        if confidence > best_confidence:
                            best_category = category
                            best_confidence = confidence
        
        return best_category, best_confidence
    
    def categorize_by_amount_pattern(self, amount: float, transaction_name: str) -> Tuple[str, float]:
        """
        Categorize transaction based on amount patterns
        
        Args:
            amount: Transaction amount
            transaction_name: Transaction name for context
            
        Returns:
            Tuple of (category, confidence)
        """
        # Common amount patterns
        if amount < 0:  # Income (negative amounts in Plaid)
            return 'Income', 0.9
        elif amount < 5:  # Very small amounts
            return 'Other', 0.3
        elif 5 <= amount <= 50:  # Small purchases
            if any(keyword in transaction_name.lower() for keyword in ['coffee', 'drink', 'snack', 'food']):
                return 'Food & Dining', 0.7
            return 'Other', 0.4
        elif 50 <= amount <= 200:  # Medium purchases
            return 'Shopping', 0.5
        elif 200 <= amount <= 1000:  # Large purchases
            return 'Shopping', 0.6
        elif amount > 1000:  # Very large amounts
            if any(keyword in transaction_name.lower() for keyword in ['rent', 'mortgage', 'payment']):
                return 'Housing', 0.8
            return 'Other', 0.4
        
        return 'Other', 0.3
    
    def detect_recurring_transaction(self, transaction: Dict[str, Any], user_transactions: List[Dict[str, Any]]) -> bool:
        """
        Detect if a transaction is likely recurring based on historical patterns
        
        Args:
            transaction: Current transaction
            user_transactions: List of user's historical transactions
            
        Returns:
            True if transaction appears to be recurring
        """
        if not user_transactions:
            return False
        
        transaction_name = transaction.get('name', '').lower()
        amount = abs(float(transaction.get('amount', 0)))
        
        # Look for similar transactions in the past
        similar_transactions = []
        for hist_tx in user_transactions:
            hist_name = hist_tx.get('name', '').lower()
            hist_amount = abs(float(hist_tx.get('amount', 0)))
            
            # Check for similar names (fuzzy matching)
            if self._names_similar(transaction_name, hist_name):
                # Check for similar amounts
                if abs(amount - hist_amount) / max(amount, hist_amount) <= self.RECURRING_AMOUNT_TOLERANCE:
                    similar_transactions.append(hist_tx)
        
        # If we found 2+ similar transactions, it's likely recurring
        return len(similar_transactions) >= 2
    
    def _names_similar(self, name1: str, name2: str) -> bool:
        """
        Check if two transaction names are similar (for recurring detection)
        """
        # Remove common prefixes/suffixes and normalize
        def normalize_name(name):
            # Remove common prefixes
            prefixes = ['pos ', 'debit ', 'credit ', 'ach ', 'transfer ']
            for prefix in prefixes:
                if name.startswith(prefix):
                    name = name[len(prefix):]
            
            # Remove common suffixes
            suffixes = [' inc', ' llc', ' corp', ' ltd', ' co']
            for suffix in suffixes:
                if name.endswith(suffix):
                    name = name[:-len(suffix)]
            
            return name.strip().lower()
        
        norm1 = normalize_name(name1)
        norm2 = normalize_name(name2)
        
        # Check if one name contains the other (with minimum length)
        if len(norm1) >= 5 and len(norm2) >= 5:
            return norm1 in norm2 or norm2 in norm1
        
        return False
    
    def categorize_transaction(self, plaid_transaction: Dict[str, Any], user_transactions: List[Dict[str, Any]] = None) -> CategorizationResult:
        """
        Comprehensive transaction categorization
        
        Args:
            plaid_transaction: Raw transaction data from Plaid API
            user_transactions: Optional list of user's historical transactions for recurring detection
            
        Returns:
            CategorizationResult with category, confidence, and reasoning
        """
        transaction_name = plaid_transaction.get('name', '')
        merchant_name = plaid_transaction.get('merchant_name')
        plaid_categories = plaid_transaction.get('category', [])
        amount = abs(float(plaid_transaction.get('amount', 0)))
        
        # Method 1: Use Plaid categories if available
        if plaid_categories and plaid_categories[0] != 'Other':
            return CategorizationResult(
                category=plaid_categories[0],
                confidence=0.9,
                is_recurring=False,  # Will be determined separately
                detection_method='plaid_category',
                reasoning=f"Used Plaid category: {plaid_categories[0]}"
            )
        
        # Method 2: Merchant name pattern matching
        merchant_category, merchant_confidence = self.categorize_by_merchant(transaction_name, merchant_name)
        if merchant_confidence > 0.6:
            is_recurring = False
            if user_transactions:
                is_recurring = self.detect_recurring_transaction(plaid_transaction, user_transactions)
            
            return CategorizationResult(
                category=merchant_category,
                confidence=merchant_confidence,
                is_recurring=is_recurring,
                detection_method='merchant_match',
                reasoning=f"Matched merchant pattern: {merchant_category}"
            )
        
        # Method 3: Amount pattern analysis
        amount_category, amount_confidence = self.categorize_by_amount_pattern(amount, transaction_name)
        if amount_confidence > 0.5:
            is_recurring = False
            if user_transactions:
                is_recurring = self.detect_recurring_transaction(plaid_transaction, user_transactions)
            
            return CategorizationResult(
                category=amount_category,
                confidence=amount_confidence,
                is_recurring=is_recurring,
                detection_method='amount_pattern',
                reasoning=f"Based on amount pattern: {amount_category}"
            )
        
        # Method 4: Fallback categorization
        is_recurring = False
        if user_transactions:
            is_recurring = self.detect_recurring_transaction(plaid_transaction, user_transactions)
        
        return CategorizationResult(
            category='Other',
            confidence=0.3,
            is_recurring=is_recurring,
            detection_method='fallback',
            reasoning="No specific patterns detected, using fallback category"
        )


# Convenience functions for easy integration
def categorize_transaction(plaid_transaction: Dict[str, Any], user_transactions: List[Dict[str, Any]] = None) -> CategorizationResult:
    """
    Categorize a single transaction
    
    Args:
        plaid_transaction: Raw transaction data from Plaid API
        user_transactions: Optional list of user's historical transactions
        
    Returns:
        CategorizationResult with category and confidence
    """
    categorizer = TransactionCategorizer()
    return categorizer.categorize_transaction(plaid_transaction, user_transactions)


def get_transaction_category(plaid_transaction: Dict[str, Any], user_transactions: List[Dict[str, Any]] = None) -> str:
    """
    Get just the category string for a transaction
    
    Args:
        plaid_transaction: Raw transaction data from Plaid API
        user_transactions: Optional list of user's historical transactions
        
    Returns:
        Category string
    """
    result = categorize_transaction(plaid_transaction, user_transactions)
    return result.category


def is_transaction_recurring(plaid_transaction: Dict[str, Any], user_transactions: List[Dict[str, Any]] = None) -> bool:
    """
    Check if a transaction is likely recurring
    
    Args:
        plaid_transaction: Raw transaction data from Plaid API
        user_transactions: Optional list of user's historical transactions
        
    Returns:
        True if transaction appears to be recurring
    """
    result = categorize_transaction(plaid_transaction, user_transactions)
    return result.is_recurring
