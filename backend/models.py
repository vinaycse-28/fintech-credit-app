from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String(64), primary_key=True, index=True)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    businesses = relationship("Business", back_populates="user", cascade="all, delete-orphan")


class Business(Base):
    __tablename__ = "businesses"

    id = Column(String(64), primary_key=True, index=True)
    user_id = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    business_name = Column(String(255), nullable=False, index=True)
    business_type = Column(String(128), nullable=True)
    location = Column(String(255), nullable=True)
    business_age = Column(String(64), nullable=True)
    employees = Column(String(64), nullable=True)
    declared_monthly_revenue = Column(Float, default=0.0)
    existing_monthly_emi = Column(Float, default=0.0)
    primary_payment_method = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="businesses")
    transactions = relationship("Transaction", back_populates="business", cascade="all, delete-orphan")
    analysis_results = relationship("AnalysisResult", back_populates="business", cascade="all, delete-orphan")


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(String(64), primary_key=True, index=True)
    business_id = Column(String(64), ForeignKey("businesses.id", ondelete="CASCADE"), nullable=False, index=True)
    date = Column(String(32), nullable=False, index=True)
    amount = Column(Float, nullable=False)
    transaction_type = Column(String(32), nullable=False)  # 'credit'/'debit' or 'income'/'expense'
    category = Column(String(128), nullable=True)
    payment_method = Column(String(64), nullable=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    business = relationship("Business", back_populates="transactions")


class AnalysisResult(Base):
    __tablename__ = "analysis_results"

    id = Column(String(64), primary_key=True, index=True)
    business_id = Column(String(64), ForeignKey("businesses.id", ondelete="CASCADE"), nullable=False, index=True)
    revenue = Column(Float, default=0.0)
    expenses = Column(Float, default=0.0)
    cash_flow = Column(Float, default=0.0)
    transaction_frequency = Column(Float, default=0.0)
    transaction_gaps = Column(Integer, default=0)
    seasonality_score = Column(Float, default=0.0)
    payment_mix_score = Column(Float, default=0.0)
    trust_score = Column(Float, default=0.0)
    consistency_score = Column(Float, default=0.0)
    creditworthiness_score = Column(Integer, default=0)
    risk_level = Column(String(64), nullable=False)
    analysis_json = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    business = relationship("Business", back_populates="analysis_results")
