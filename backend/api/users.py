from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from database import supabase
import schemas
from api.auth import get_current_user
from datetime import datetime

router = APIRouter()

@router.post("/register")
async def register(user: schemas.UserCreate):
    try:
        auth_response = supabase.auth.sign_up({
            "email": user.email,
            "password": user.password,
        })
        
        if not auth_response.user:
            raise HTTPException(status_code=400, detail="Supabase Auth registration failed")
        
        db_response = supabase.table("users").insert({
            "id": auth_response.user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role.lower(),
            "upi_id": user.upi_id,
            "password": "SU_AUTH_MANAGED"
        }).execute()
        
        return {"message": "User registered successfully.", "user": db_response.data[0]}
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login", response_model=schemas.Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    try:
        auth_response = supabase.auth.sign_in_with_password({
            "email": form_data.username,
            "password": form_data.password,
        })
        
        if not auth_response.session:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        user_data = supabase.table("users").select("role, name").eq("id", auth_response.user.id).execute()
        
        if not user_data.data:
            raise HTTPException(status_code=400, detail="User profile not found")
        
        return {
            "access_token": auth_response.session.access_token,
            "token_type": "bearer",
            "role": user_data.data[0]["role"].lower(), # Ensure lowercase
            "name": user_data.data[0]["name"]
        }
    except Exception as e:
        err_msg = str(e)
        if "Email not confirmed" in err_msg:
            raise HTTPException(status_code=401, detail="Please verify your email address. Check your inbox for a confirmation link.")
        raise HTTPException(status_code=401, detail=err_msg)

@router.get("/me", response_model=schemas.UserResponse)
async def get_me(user: dict = Depends(get_current_user)):
    return user

@router.patch("/me/upi")
async def update_upi(upi_id: str, user: dict = Depends(get_current_user)):
    # Use upsert to handle cases where the profile row might be missing for old accounts
    profile_data = {
        "id": user["id"],
        "email": user["email"],
        "name": user.get("name", "User"),
        "role": user.get("role", "customer"),
        "upi_id": upi_id,
        "password": "SU_AUTH_MANAGED" # Satisfy the NOT NULL constraint
    }
    try:
        response = supabase.table("users").upsert(profile_data).execute()
        if not response.data:
            raise Exception("No data returned after upsert")
        return {"message": "UPI Profile Synchronized successfully"}
    except Exception as e:
        print(f"CRITICAL UPI UPDATE ERROR: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Database sync failed: {str(e)}")
