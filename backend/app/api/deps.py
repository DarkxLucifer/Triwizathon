from typing import Generator, List, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.user import User
from app.models.esports import Player
from app.schemas.auth import UserOut

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def get_current_user_with_payload(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> tuple[User, dict]:
    """Dependency that decodes JWT, returns User and raw token payload."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception
    user_id = payload.get("sub")
    if user_id is None:
        raise credentials_exception

    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise credentials_exception
    return user, payload


def get_current_user(
    user_and_payload: tuple[User, dict] = Depends(get_current_user_with_payload)
) -> User:
    """Dependency that returns current authenticated User with active_context attached."""
    user, payload = user_and_payload
    active_ctx = payload.get("active_context")
    if not active_ctx:
        active_ctx = "player" if user.role == "player" else "organiser"
    user.active_context = active_ctx  # type: ignore[attr-defined]
    return user


def require_role(allowed_roles: List[str]):
    """Role-based authorization dependency factory."""
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles and current_user.role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Operation not permitted for role '{current_user.role}'."
            )
        return current_user
    return role_checker


def require_organiser(current_user: User = Depends(get_current_user)) -> User:
    """Dependency ensuring caller is an organiser acting in an organiser context."""
    active_ctx = getattr(current_user, "active_context", None)
    if active_ctx != "organiser" and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Operation requires active Organiser context."
        )
    if not current_user.org_id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Organiser account is not associated with an organization."
        )
    return current_user


def require_player(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Player:
    """Dependency ensuring caller is a player acting in player context, returning Player."""
    active_ctx = getattr(current_user, "active_context", None)
    if active_ctx != "player" and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Operation requires active Player context."
        )
    if not current_user.player_id:
        # Check if a player record exists with user_id == current_user.id
        player = db.query(Player).filter(Player.user_id == current_user.id).first()
        if player:
            current_user.player_id = player.id
            db.commit()
            return player
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No player profile associated with this user account."
        )
    player = db.query(Player).filter(Player.id == current_user.player_id).first()
    if not player:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Associated player profile not found."
        )
    return player


def enforce_org_isolation(resource_org_id: int, current_user: User):
    """Enforces strict multi-tenancy: caller can only access resources belonging to their org_id."""
    if current_user.role == "admin":
        return
    if resource_org_id != current_user.org_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: resource belongs to a different organization."
        )


def build_user_out(user: User, active_context: Optional[str] = None) -> UserOut:
    """Constructs UserOut response model with computed available_contexts."""
    available_contexts = []
    if user.player_id is not None or user.role == "player":
        available_contexts.append("player")
    if user.org_id is not None or user.role in ["analyst", "coach", "gm", "admin"]:
        available_contexts.append("organiser")
    if not available_contexts:
        available_contexts = ["organiser"]

    if not active_context or active_context not in available_contexts:
        active_context = available_contexts[0]

    org_name = user.organization.name if user.organization else None
    return UserOut(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        org_id=user.org_id,
        org_name=org_name,
        player_id=user.player_id,
        active_context=active_context,
        available_contexts=available_contexts,
        created_at=user.created_at,
    )
