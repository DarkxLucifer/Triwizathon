from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token
from app.models.organization import Organization
from app.models.user import User
from app.schemas.auth import UserRegister, UserLogin, TokenResponse, UserOut

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    # Check if user already exists
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )

    # Check or create organization
    org_slug = user_in.org_name.lower().replace(" ", "-")
    org = db.query(Organization).filter(Organization.slug == org_slug).first()
    if not org:
        org = Organization(name=user_in.org_name, slug=org_slug)
        db.add(org)
        db.flush()

    # Create new user
    hashed_pwd = get_password_hash(user_in.password)
    user = User(
        org_id=org.id,
        email=user_in.email,
        hashed_password=hashed_pwd,
        full_name=user_in.full_name,
        role=user_in.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": str(user.id), "org_id": org.id, "role": user.role})
    user_out = UserOut(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        org_id=org.id,
        org_name=org.name,
        created_at=user.created_at,
    )
    return TokenResponse(access_token=token, token_type="bearer", user=user_out)


@router.post("/login", response_model=TokenResponse)
def login(login_in: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_in.email).first()
    if not user or not verify_password(login_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token({"sub": str(user.id), "org_id": user.org_id, "role": user.role})
    user_out = UserOut(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        org_id=user.org_id,
        org_name=user.organization.name,
        created_at=user.created_at,
    )
    return TokenResponse(access_token=token, token_type="bearer", user=user_out)
