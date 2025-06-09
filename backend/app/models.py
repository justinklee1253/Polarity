import uuid
from .database import Base
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import UUID
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
    total_balance = Column(Integer, nullable=True, default=0)
    salary_monthly = Column(Integer, nullable=True, default=0)
    monthly_spending_goal = Column(Integer, nullable=True, default=0)

    #Onboarding tracking fields
    onboarding_completed = Column(Boolean, default=False)
    onboarding_step = Column(Integer, default=0)

    college_name = Column(String(200), nullable=True)
    is_student = Column(Boolean, nullable=True)
    financial_goals = Column(Text, nullable=True) #json string of goals (have options)


