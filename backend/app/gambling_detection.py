"""
Gambling Detection Module

This module provides comprehensive gambling transaction detection for Plaid transactions.
It uses both merchant name matching and Plaid category analysis to identify gambling-related transactions.

Features:
- Well-known sportsbook and gambling platform detection
- Keyword-based merchant name matching
- Plaid category analysis
- Modular and testable design
- Easy to update merchant lists
"""

import re
from typing import Dict, List, Optional, Any
from dataclasses import dataclass


@dataclass
class GamblingDetectionResult:
    """Result of gambling detection analysis"""
    is_gambling: bool
    confidence: float  # 0.0 to 1.0
    detection_method: str  # 'merchant_match', 'category_match', 'keyword_match', 'combined'
    matched_merchants: List[str]
    matched_keywords: List[str]
    matched_categories: List[str]


class GamblingDetector:
    """
    Main class for detecting gambling transactions from Plaid data
    """
    
    # Well-known sportsbooks and gambling platforms
    GAMBLING_MERCHANTS = [
        "FanDuel", "DraftKings", "BetMGM", "Barstool Sportsbook",
        "Caesars Sportsbook", "PointsBet", "BetRivers", "PrizePicks",
        "Underdog Fantasy", "Betr", "Hard Rock Bet", "WynnBET", "Betway",
        "SuperBook", "Tipico", "Fox Bet", "Bovada", "Stake", "Ignition Casino",
        "Bet365", "William Hill", "Unibet", "888 Casino", "PokerStars",
        "PartyPoker", "Gala Casino", "Ladbrokes", "Coral", "Paddy Power",
        "Sky Bet", "Betfair", "BetVictor", "Sportingbet", "Bwin",
        "Interwetten", "Tipbet", "MyBookie", "Heritage Sports", "Bookmaker",
        "5Dimes", "BetOnline", "SportsBetting.ag", "GTBets", "BetDSI",
        "YouWager", "BetUS", "Sportsbook.ag", "LowVig.ag", "JustBet",
        "BetAnySports", "BetNow", "BetOnline.ag", "SportsBetting", "BetDSI",
        "Bovada.lv", "Slots.lv", "Cafe Casino", "Ignition Casino", "Red Dog Casino",
        "El Royale Casino", "Las Atlantis", "Wild Casino", "Super Slots",
        "BetUS Casino", "SportsBetting.ag Casino", "MyBookie Casino"
    ]
    
    # Keywords that indicate gambling transactions
    GAMBLING_KEYWORDS = [
        "draftkings", "fanduel", "betmgm", "caesars", "bet365",
        "pokerstars", "casino", "lottery", "bet", "gambling",
        "sportsbook", "wagering", "poker", "slots", "blackjack",
        "roulette", "baccarat", "craps", "keno", "bingo",
        "sports betting", "online casino", "poker room", "betting",
        "wager", "stake", "odds", "handicap", "spread", "parlay",
        "prop bet", "futures", "live betting", "in-play", "cash out",
        "bonus", "promo", "jackpot",
        "progressive", "tournament", "sit and go", "cash game",
        "fantasy sports", "daily fantasy", "dfs", "pick'em",
        "prop", "over/under", "moneyline", "point spread"
    ]
    
    # Plaid categories that indicate gambling
    GAMBLING_CATEGORIES = [
        "Gambling", "Sports Betting", "Casino", "Lottery", "Poker",
        "Betting", "Wagering", "Gaming", "Online Gambling", "Fantasy Sports"
    ]
    
    def __init__(self):
        """Initialize the gambling detector with compiled regex patterns"""
        # Create case-insensitive regex patterns for efficient matching
        self.merchant_patterns = [
            re.compile(re.escape(merchant), re.IGNORECASE) 
            for merchant in self.GAMBLING_MERCHANTS
        ]
        
        self.keyword_patterns = [
            re.compile(r'\b' + re.escape(keyword) + r'\b', re.IGNORECASE)
            for keyword in self.GAMBLING_KEYWORDS
        ]
    
    def normalize_text(self, text: str) -> str:
        """
        Normalize text for better matching by removing extra spaces and special characters
        """
        if not text:
            return ""
        # Remove extra spaces and normalize
        return re.sub(r'\s+', ' ', text.strip())
    
    def detect_gambling_merchants(self, transaction_name: str, merchant_name: Optional[str] = None) -> List[str]:
        """
        Detect if transaction involves known gambling merchants
        
        Args:
            transaction_name: The transaction name from Plaid
            merchant_name: Optional merchant name from Plaid
            
        Returns:
            List of matched merchant names
        """
        matched_merchants = []
        text_to_check = [transaction_name]
        
        if merchant_name:
            text_to_check.append(merchant_name)
        
        for text in text_to_check:
            if not text:
                continue
                
            normalized_text = self.normalize_text(text)
            
            for i, pattern in enumerate(self.merchant_patterns):
                if pattern.search(normalized_text):
                    merchant = self.GAMBLING_MERCHANTS[i]
                    if merchant not in matched_merchants:
                        matched_merchants.append(merchant)
        
        return matched_merchants
    
    def detect_gambling_keywords(self, transaction_name: str, merchant_name: Optional[str] = None) -> List[str]:
        """
        Detect gambling-related keywords in transaction text
        
        Args:
            transaction_name: The transaction name from Plaid
            merchant_name: Optional merchant name from Plaid
            
        Returns:
            List of matched keywords
        """
        matched_keywords = []
        text_to_check = [transaction_name]
        
        if merchant_name:
            text_to_check.append(merchant_name)
        
        for text in text_to_check:
            if not text:
                continue
                
            normalized_text = self.normalize_text(text)
            
            for i, pattern in enumerate(self.keyword_patterns):
                if pattern.search(normalized_text):
                    keyword = self.GAMBLING_KEYWORDS[i]
                    if keyword not in matched_keywords:
                        matched_keywords.append(keyword)
        
        return matched_keywords
    
    def detect_gambling_categories(self, plaid_categories: List[str]) -> List[str]:
        """
        Detect gambling-related Plaid categories
        
        Args:
            plaid_categories: List of category strings from Plaid
            
        Returns:
            List of matched gambling categories
        """
        matched_categories = []
        
        if not plaid_categories:
            return matched_categories
        
        # Convert to lowercase for case-insensitive matching
        categories_lower = [cat.lower() for cat in plaid_categories]
        gambling_categories_lower = [cat.lower() for cat in self.GAMBLING_CATEGORIES]
        
        for i, gambling_cat in enumerate(gambling_categories_lower):
            for plaid_cat in categories_lower:
                if gambling_cat in plaid_cat or plaid_cat in gambling_cat:
                    original_cat = self.GAMBLING_CATEGORIES[i]
                    if original_cat not in matched_categories:
                        matched_categories.append(original_cat)
        
        return matched_categories
    
    def analyze_transaction(self, plaid_transaction: Dict[str, Any]) -> GamblingDetectionResult:
        """
        Comprehensive analysis of a Plaid transaction for gambling indicators
        
        Args:
            plaid_transaction: Raw transaction data from Plaid API
            
        Returns:
            GamblingDetectionResult with detection details
        """
        # Extract relevant fields from Plaid transaction
        transaction_name = plaid_transaction.get('name', '')
        merchant_name = plaid_transaction.get('merchant_name')
        plaid_categories = plaid_transaction.get('category', [])
        amount = plaid_transaction.get('amount', 0)
        
        # Skip gambling detection for income transactions (negative amounts in Plaid)
        if amount < 0:
            return GamblingDetectionResult(
                is_gambling=False,
                confidence=0.0,
                detection_method='none',
                matched_merchants=[],
                matched_keywords=[],
                matched_categories=[]
            )
        
        # Perform detection using all methods
        matched_merchants = self.detect_gambling_merchants(transaction_name, merchant_name) #return list of matched merchants
        matched_keywords = self.detect_gambling_keywords(transaction_name, merchant_name) #return list of matched keywords
        matched_categories = self.detect_gambling_categories(plaid_categories) #return list of matched categories
        
        # Determine if this is a gambling transaction
        is_gambling = bool(matched_merchants or matched_keywords or matched_categories)
        
        # Calculate confidence score
        confidence = 0.0
        detection_methods = []
        
        if matched_merchants:
            confidence += 0.8  # High confidence for known merchants
            detection_methods.append('merchant_match')
        
        if matched_categories:
            confidence += 0.7  # High confidence for Plaid categories
            detection_methods.append('category_match')
        
        if matched_keywords:
            confidence += 0.5  # Medium confidence for keywords
            detection_methods.append('keyword_match')
        
        # Cap confidence at 1.0
        confidence = min(confidence, 1.0)
        
        # Determine primary detection method
        if not detection_methods:
            primary_method = 'none'
        elif 'merchant_match' in detection_methods:
            primary_method = 'merchant_match'
        elif 'category_match' in detection_methods:
            primary_method = 'category_match'
        elif 'keyword_match' in detection_methods:
            primary_method = 'keyword_match'
        else:
            primary_method = 'combined'
        
        return GamblingDetectionResult(
            is_gambling=is_gambling,
            confidence=confidence,
            detection_method=primary_method,
            matched_merchants=matched_merchants,
            matched_keywords=matched_keywords,
            matched_categories=matched_categories
        )


# Convenience functions for easy integration
def is_sportsbook_or_gambling(plaid_transaction: Dict[str, Any]) -> bool:
    """
    Simple boolean check for gambling transactions
    
    Args:
        plaid_transaction: Raw transaction data from Plaid API
        
    Returns:
        True if transaction appears to be gambling-related
    """
    detector = GamblingDetector()
    result = detector.analyze_transaction(plaid_transaction)
    return result.is_gambling


def get_gambling_detection_details(plaid_transaction: Dict[str, Any]) -> GamblingDetectionResult:
    """
    Get detailed gambling detection analysis
    
    Args:
        plaid_transaction: Raw transaction data from Plaid API
        
    Returns:
        Detailed detection result with confidence and method information
    """
    detector = GamblingDetector()
    return detector.analyze_transaction(plaid_transaction)


def categorize_gambling_transaction(plaid_transaction: Dict[str, Any]) -> str:
    """
    Get appropriate category for gambling transactions
    
    Args:
        plaid_transaction: Raw transaction data from Plaid API
        
    Returns:
        Category string for the transaction
    """
    result = get_gambling_detection_details(plaid_transaction)
    
    if not result.is_gambling:
        return None
    
    # Prioritize category based on detection method
    if result.matched_merchants:
        # If we matched specific merchants, use more specific categories
        if any('sports' in merchant.lower() or 'bet' in merchant.lower() 
               for merchant in result.matched_merchants):
            return 'Sports Betting'
        elif any('casino' in merchant.lower() or 'poker' in merchant.lower()
                 for merchant in result.matched_merchants):
            return 'Casino'
        else:
            return 'Gambling'
    
    if result.matched_categories:
        return result.matched_categories[0]  # Use first matched category
    
    if result.matched_keywords:
        # Categorize based on keywords
        if any(keyword in ['sports betting', 'sportsbook', 'betting'] 
               for keyword in result.matched_keywords):
            return 'Sports Betting'
        elif any(keyword in ['casino', 'poker', 'slots', 'blackjack'] 
                 for keyword in result.matched_keywords):
            return 'Casino'
        else:
            return 'Gambling'
    
    return 'Gambling'  # Default fallback
