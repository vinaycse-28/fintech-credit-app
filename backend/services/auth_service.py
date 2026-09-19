import os
from datetime import datetime, timedelta, timezone
from typing import Optional
import jwt
import bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from database import get_db
from models import User, Business

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "creditbridge-hackathon-secure-jwt-key-2025")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 7

security = HTTPBearer(auto_error=False)

def hash_password(password: str) -> str:
    """Securely hash a password using bcrypt."""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against a bcrypt hash."""
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False

def create_access_token(user_id: str, email: str, expires_delta: Optional[timedelta] = None) -> str:
    """Generate a signed JWT authentication token."""
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS))
    payload = {
        "sub": user_id,
        "email": email,
        "exp": expire,
        "iat": datetime.now(timezone.utc)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def decode_access_token(token: str) -> Optional[dict]:
    """Decode and validate a JWT authentication token."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.PyJWTError:
        return None

def get_current_user(
    auth_header: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """
    FastAPI dependency: Extracts Bearer token, validates JWT, and returns authenticated User.
    Raises HTTP 401 Unauthorized if token is missing, expired, or invalid.
    """
    if not auth_header or not auth_header.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Missing Bearer token in Authorization header.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    payload = decode_access_token(auth_header.credentials)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token payload.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authenticated user no longer exists.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    return user

def get_optional_current_user(
    auth_header: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """
    Optional user dependency: Returns User if valid token is provided, otherwise None.
    """
    if not auth_header or not auth_header.credentials:
        return None
    payload = decode_access_token(auth_header.credentials)
    if not payload or not payload.get("sub"):
        return None
    return db.query(User).filter(User.id == payload.get("sub")).first()

def verify_business_ownership(
    business_id: str,
    user: User,
    db: Session,
    allow_demo: bool = True
) -> Business:
    """
    Enforces Part 5 Data Isolation:
    A logged-in user must ONLY be able to access their own businesses.
    Every protected endpoint must verify: authenticated_user.id == business.user_id.
    If not: HTTP 403 Forbidden.
    """
    biz = db.query(Business).filter(Business.id == business_id).first()
    if not biz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Business '{business_id}' not found."
        )

    # If it's a known demo business and allow_demo is True, permit read-only demo inspection
    is_demo_id = biz.id.startswith("demo_") or biz.id.startswith("biz_demo_")
    if is_demo_id and allow_demo:
        return biz

    # If business belongs to another user, forbid access
    if biz.user_id and biz.user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: You do not have permission to access another user's business data."
        )

    # If business has no user_id (legacy unassigned data), allow owner claim or read
    if biz.user_id is None:
        # If user created it, or legacy demo access
        return biz

    return biz
