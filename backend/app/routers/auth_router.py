from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.auth import verify_password, get_password_hash, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=schemas.Token)
def register(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")
    
    new_user = models.User(
        email=user_in.email,
        full_name=user_in.full_name,
        role=user_in.role,
        company_name=user_in.company_name,
        hashed_password=get_password_hash(user_in.password)
    )
    db.add(new_user)
    db.flush()

    if new_user.role == "merchant":
        merchant = models.Merchant(
            user_id=new_user.id,
            business_name=user_in.company_name or f"{new_user.full_name}'s Business",
            paypal_merchant_id=f"PP-M-{new_user.id:05d}"
        )
        db.add(merchant)

    db.commit()
    db.refresh(new_user)

    token = create_access_token({"sub": new_user.email, "role": new_user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": new_user
    }

@router.post("/login", response_model=schemas.Token)
def login(login_req: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == login_req.email).first()
    if not user or not verify_password(login_req.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password.")
    
    token = create_access_token({"sub": user.email, "role": user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/demo-login/{role}", response_model=schemas.Token)
def demo_login(role: str, db: Session = Depends(get_db)):
    """1-Click instant authentication for accounts (merchant or customer)"""
    email = "merchant@paysure.ai" if role == "merchant" else "customer@paysure.ai"
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        # Fallback to matching role or any user
        user = db.query(models.User).filter(models.User.role == role).first() or db.query(models.User).first()
    
    token = create_access_token({"sub": user.email, "role": user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/me", response_model=schemas.UserResponse)
def get_me(current_user: models.User = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return current_user
