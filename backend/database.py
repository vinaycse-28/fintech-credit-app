import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DEFAULT_DB_FILE = os.path.join(BASE_DIR, "creditbridge.db")

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    db_file_uri = DEFAULT_DB_FILE.replace("\\", "/")
    DATABASE_URL = f"sqlite:///{db_file_uri}"

# SQLite needs connect_args={"check_same_thread": False}
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

try:
    from migrate import run_migrations
    run_migrations(DEFAULT_DB_FILE)
except Exception as e:
    print(f"[DB] Migration check notice: {e}")

def get_db():
    """Dependency that provides a request-scoped database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
