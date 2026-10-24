from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token
from app.models.organization import Organization
from app.models.user import User
from app.models.portal import Notification
from app.schemas.auth import (
    UserRegister,
    UserLogin,
    TokenResponse,
    UserOut,
    ContextSwitchRequest,
    UserMeResponse,
)
from app.api.deps import get_current_user, build_user_out

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

    org_id = None
    if user_in.org_name:
        org_slug = user_in.org_name.lower().replace(" ", "-")
        org = db.query(Organization).filter(Organization.slug == org_slug).first()
        if not org:
            org = Organization(name=user_in.org_name, slug=org_slug)
            db.add(org)
            db.flush()
        org_id = org.id

    # Create new user
    hashed_pwd = get_password_hash(user_in.password)
    user = User(
        org_id=org_id,
        email=user_in.email,
        hashed_password=hashed_pwd,
        full_name=user_in.full_name,
        role=user_in.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    initial_context = "player" if user.role == "player" else "organiser"
    token = create_access_token({
        "sub": str(user.id),
        "org_id": user.org_id,
        "role": user.role,
        "active_context": initial_context,
    })
    user_out = build_user_out(user, active_context=initial_context)
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

    initial_context = "player" if (user.role == "player" or user.player_id is not None) else "organiser"
    token = create_access_token({
        "sub": str(user.id),
        "org_id": user.org_id,
        "role": user.role,
        "active_context": initial_context,
    })
    user_out = build_user_out(user, active_context=initial_context)
    return TokenResponse(access_token=token, token_type="bearer", user=user_out)


@router.get("/me", response_model=UserMeResponse)
def get_me(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    active_ctx = getattr(current_user, "active_context", "organiser")
    user_out = build_user_out(current_user, active_context=active_ctx)

    player_summary = None
    if current_user.player:
        p = current_user.player
        player_summary = {
            "id": p.id,
            "handle": p.handle,
            "name": p.name,
            "role": p.role.name if p.role else "Rifle",
            "primary_game": p.primary_game,
            "avatar_url": p.avatar_url,
        }

    org_summary = None
    if current_user.organization:
        o = current_user.organization
        org_summary = {
            "id": o.id,
            "name": o.name,
            "slug": o.slug,
        }

    unread_count = db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.read_at.is_(None)
    ).count()

    return UserMeResponse(
        user=user_out,
        player_summary=player_summary,
        organization_summary=org_summary,
        unread_notifications_count=unread_count,
    )


@router.post("/switch-context", response_model=TokenResponse)
def switch_context(
    request: ContextSwitchRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_out = build_user_out(current_user)
    if request.target_context not in user_out.available_contexts:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"User does not hold credentials for '{request.target_context}' context."
        )

    # If switching to organiser and an org_id is provided, verify membership
    target_org_id = current_user.org_id
    if request.target_context == "organiser" and request.target_org_id:
        if request.target_org_id != current_user.org_id and current_user.role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User does not have access to the requested organization."
            )
        target_org_id = request.target_org_id

    # Create new JWT with the new active_context
    token = create_access_token({
        "sub": str(current_user.id),
        "org_id": target_org_id,
        "role": current_user.role,
        "active_context": request.target_context,
    })
    updated_user_out = build_user_out(current_user, active_context=request.target_context)
    return TokenResponse(access_token=token, token_type="bearer", user=updated_user_out)
