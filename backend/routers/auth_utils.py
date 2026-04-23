"""
JWT & password utilities for BrewAnalytics auth.
"""
import os
import json
from datetime import datetime, timedelta
from typing import Optional

from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

# ─── Config ───────────────────────────────────────────────────────────────────
SECRET_KEY = "brewanalytics-super-secret-key-change-in-prod-2026"
ALGORITHM  = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24

# ─── Paths ────────────────────────────────────────────────────────────────────
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(CURRENT_DIR)
DATA_DIR    = os.path.join(BACKEND_DIR, "data")
USERS_FILE  = os.path.join(DATA_DIR, "users.json")

# ─── Password hashing ─────────────────────────────────────────────────────────
pwd_ctx = CryptContext(schemes=["bcrypt", "pbkdf2_sha256"], deprecated="auto", bcrypt__ident="2b")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)

# ─── Seed users (9 shops + admin) ─────────────────────────────────────────────
SEED_USERS = [
    {"email": "vrindavan@brew.com",   "shop": "Vrindavan",                    "role": "manager"},
    {"email": "cluckins@brew.com",    "shop": "Cluckins",                     "role": "manager"},
    {"email": "amarfrankie@brew.com", "shop": "Amar Frankie",                 "role": "manager"},
    {"email": "manchurian@brew.com",  "shop": "Manchurian Shop",              "role": "manager"},
    {"email": "shawarma@brew.com",    "shop": "Shawarma Shop",                "role": "manager"},
    {"email": "juicecenter@brew.com", "shop": "Juice Center",                 "role": "manager"},
    {"email": "spjimr@brew.com",      "shop": "SPJIMR Mess",                  "role": "manager"},
    {"email": "canteengf@brew.com",   "shop": "College Canteen Ground Floor", "role": "manager"},
    {"email": "canteen3f@brew.com",   "shop": "College Canteen 3rd Floor",    "role": "manager"},
    {"email": "admin@brew.com",       "shop": "All",                          "role": "admin"},
]
SEED_PASSWORD = "brew123"
ADMIN_PASSWORD = "admin123"


def _ensure_users_file():
    """Create users.json with seed accounts if it doesn't exist."""
    os.makedirs(DATA_DIR, exist_ok=True)
    if not os.path.exists(USERS_FILE):
        users = []
        for u in SEED_USERS:
            pwd = ADMIN_PASSWORD if u["role"] == "admin" else SEED_PASSWORD
            users.append({
                "email":    u["email"],
                "shop":     u["shop"],
                "role":     u["role"],
                "hashed_password": pwd_ctx.hash(pwd),
                "created_at": datetime.utcnow().isoformat()
            })
        with open(USERS_FILE, "w") as f:
            json.dump(users, f, indent=2)
        print(f"✅  users.json seeded with {len(users)} accounts at {USERS_FILE}")


def load_users():
    _ensure_users_file()
    with open(USERS_FILE, "r") as f:
        return json.load(f)


def save_users(users):
    with open(USERS_FILE, "w") as f:
        json.dump(users, f, indent=2)


def get_user_by_email(email: str):
    users = load_users()
    return next((u for u in users if u["email"].lower() == email.lower()), None)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_ctx.verify(plain, hashed)


def hash_password(plain: str) -> str:
    return pwd_ctx.hash(plain)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> dict:
    """Decode JWT token, raises HTTPException on failure."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )


def get_current_user(token: str = Depends(oauth2_scheme)):
    """FastAPI dependency: extracts and validates the current user from JWT."""
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return decode_token(token)


def get_current_shop(token: str = Depends(oauth2_scheme)) -> str:
    """FastAPI dependency: returns the logged-in user's shop name."""
    payload = get_current_user(token)
    return payload.get("shop", "unknown")
