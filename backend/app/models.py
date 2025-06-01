import uuid
from .database import Base
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    email = Column(String, nullable=False, unique=True)
    username = Column(String, nullable=False, unique=True)
    password = Column(String, nullable=False)
    age = Column(Integer)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    total_balance = Column(Integer, nullable=False)
    salary_monthly = Column(Integer, nullable=False)
    monthly_spending_goal = Column(Integer, nullable=False)


