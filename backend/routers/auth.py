"""
Auth router: login + signup endpoints.
- Users are stored in backend/data/users.json (persists across restarts)
- 9 shop accounts are auto-seeded on first run
- New users can register freely via /signup
"""

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr
from datetime import datetime
from .auth_utils import (
    get_user_by_email,
    verify_password,
    hash_password,
    create_access_token,
    load_users,
    save_users,
)

router = APIRouter()

# ── All valid shop names ───────────────────────────────────────────────────────
VALID_SHOPS = [
    "Vrindavan",
    "Cluckins",
    "Amar Frankie",
    "Manchurian Shop",
    "Shawarma Shop",
    "Juice Center",
    "SPJIMR Mess",
    "College Canteen Ground Floor",
    "College Canteen 3rd Floor",
    "All",  # admin
]


# ── Request / Response schemas ─────────────────────────────────────────────────
class LoginRequest(BaseModel):
    email: str
    password: str


class SignupRequest(BaseModel):
    email: str
    password: str
    shop: str   # Must be one of VALID_SHOPS


class AuthResponse(BaseModel):
    token: str
    email: str
    shop: str
    role: str


# ── Endpoints ──────────────────────────────────────────────────────────────────
@router.post("/login", response_model=AuthResponse)
def login(req: LoginRequest):
    user = get_user_by_email(req.email)
    if not user or not verify_password(req.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    token = create_access_token({
        "sub":   user["email"],
        "shop":  user["shop"],
        "role":  user["role"],
        "email": user["email"],
    })

    print(f"🔐  Login: {user['email']} | Shop: {user['shop']} | Role: {user['role']}")

    return AuthResponse(
        token=token,
        email=user["email"],
        shop=user["shop"],
        role=user["role"],
    )


@router.post("/signup", response_model=AuthResponse)
def signup(req: SignupRequest):
    # Validate shop
    if req.shop not in VALID_SHOPS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid shop. Must be one of: {', '.join(VALID_SHOPS)}"
        )

    # Check duplicate
    existing = get_user_by_email(req.email)
    if existing:
        raise HTTPException(
            status_code=409,
            detail="An account with this email already exists",
        )

    # Weak password guard
    if len(req.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    # Persist new user
    users = load_users()
    new_user = {
        "email":           req.email.lower(),
        "shop":            req.shop,
        "role":            "admin" if req.shop == "All" else "manager",
        "hashed_password": hash_password(req.password),
        "created_at":      datetime.utcnow().isoformat(),
    }
    users.append(new_user)
    save_users(users)

    token = create_access_token({
        "sub":   new_user["email"],
        "shop":  new_user["shop"],
        "role":  new_user["role"],
        "email": new_user["email"],
    })

    print(f"✨  Signup: {new_user['email']} | Shop: {new_user['shop']}")

    return AuthResponse(
        token=token,
        email=new_user["email"],
        shop=new_user["shop"],
        role=new_user["role"],
    )


@router.get("/shops")
def get_shops():
    """Returns the list of valid shop names for the signup dropdown."""
    return {"shops": VALID_SHOPS[:-1]}  # exclude 'All' (admin only)
