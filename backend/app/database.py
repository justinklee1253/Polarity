import os

import psycopg2
from dotenv import load_dotenv
from contextlib import contextmanager
from sqlalchemy import create_engine, text #engine = starting point for SQLAlchemy app
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker

load_dotenv()

SQLALCHEMY_DATABASE_URL = os.getenv('DATABASE_URL')
# print(f"Database URL: {SQLALCHEMY_DATABASE_URL}") #DEBUG LINE - Commented out for security
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine) #allows the Session factory to be used by multiple functions

Base = declarative_base() #set up blueprint for building --> every model needs to extend from it so SQLAlchemy knows how to wire up walls
#Base holds metadata needed for SQLAlchemy to map python classes to actual sql tables

def test_db_connection(): #testing connection via sqlalchemy
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT version()"))
            print("DB Version:", result.fetchone())
    except Exception as e:
        print("SQLAlchemy DB connection failed:", e)

@contextmanager #set up/tear down resources automatically (used with the "with" statement in our routes)
def get_db_session():
    db = SessionLocal()
    try:
        yield db 
        db.commit() 
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()