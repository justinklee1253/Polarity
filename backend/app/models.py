from .database import Base
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey, Boolean, Numeric
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

    conversations = relationship("Conversations", back_populates="user", cascade="all, delete-orphan")

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
    
