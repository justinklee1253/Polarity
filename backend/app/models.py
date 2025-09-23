from .database import Base
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey, Boolean, Numeric, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=True)
    email = Column(String, nullable=False, unique=True)
    username = Column(String, nullable=False, unique=True)
    password = Column(String, nullable=False)
    age = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    #Financial fields (nullable for progressive onboarding)
    total_balance = Column(Numeric(10, 2), nullable=True, default=0)
    salary_monthly = Column(Integer, nullable=True, default=0)
    monthly_spending_goal = Column(Integer, nullable=True, default=0)

    #Onboarding tracking fields
    onboarding_completed = Column(Boolean, default=False)
    onboarding_step = Column(Integer, default=0)

    college_name = Column(String(200), nullable=True)
    is_student = Column(Boolean, nullable=True)
    financial_goals = Column(Text, nullable=True) #json string of goals (have options)

    plaid_access_token = Column(String, nullable=True)
    plaid_item_id = Column(String, nullable=True)  # Store Plaid item ID for webhook matching

    conversations = relationship("Conversations", back_populates="user", cascade="all, delete-orphan") #for each user, access all conversations as a list
    transactions = relationship("Transaction", back_populates="user", cascade="all, delete-orphan")

class Conversations(Base):
    """
    Has a one-to-many relationship with messages table. 
    Conversation can have multiple messages, but messages can not be linked to multiple convos.

    FK in messages (convo_id) references PK of conversations table (conversations.id) links each message to one conversation.

    relationship() used --> SQLAlchemy uses FK to understand table with FK (messages) is the "many" table, table being referenced (conversations) is the "one" side
    """
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_modified = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
    title = Column(String, nullable=True)

    messages = relationship("Messages", back_populates="conversation", cascade="all, delete-orphan")
    user = relationship("User", back_populates="conversations")

class Messages(Base):
    __tablename__ = "messages"

    # id, convo_id (FK to conversations), sender, content, created_at, metadata
    id = Column(Integer, primary_key=True, autoincrement=True)
    convo_id = Column(Integer, ForeignKey("conversations.id"), index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    sender = Column(Text, nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    conversation = relationship("Conversations", back_populates="messages")
    user = relationship("User")


#need new transactions table in our app. 

class Transaction(Base):
    __tablename__ = "transactions"
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    plaid_transaction_id = Column(String, unique=True, nullable=False)
    date_posted = Column(Date, nullable=False)
    name = Column(String, nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)
    type = Column(String, nullable=False)  # 'expense' or 'income'
    payment_source = Column(String)  # e.g., 'direct deposit', 'credit card'
    plaid_category = Column(String)  # Plaid's category
    user_category = Column(String)   # User-editable category/tag
    is_recurring = Column(Boolean, default=False)
    new_balance_after_transaction = Column(Numeric(10, 2))
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="transactions") 


class Waitlist(Base):
    __tablename__ = "waitlist"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String, nullable=False, unique=True)
    paid = Column(Boolean, default=False)
    stripe_payment_intent_id = Column(String, nullable=True)  # Store Stripe payment intent ID
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    paid_at = Column(DateTime(timezone=True), nullable=True)
    