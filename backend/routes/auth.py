from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User

router = APIRouter()


@router.post("/register")
def register(
    name: str,
    email: str,
    password: str,
    db: Session = Depends(get_db)
):

    existing_user = db.query(User).filter(
        User.email == email
    ).first()

    if existing_user:

        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )


    user = User(
        name=name,
        email=email,
        password=password
    )

    db.add(user)
    db.commit()
    db.refresh(user)


    return {
        "message": "User registered successfully",
        "user_id": user.id
    }


@router.post("/login")
def login(
    email: str,
    password: str,
    db: Session = Depends(get_db)
):

    user = db.query(User).filter(
        User.email == email
    ).first()


    if not user:

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )


    if user.password != password:

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )


    return {
        "message": "Login successful",
        "user_id": user.id,
        "name": user.name
    }