from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from typing import List
from datetime import datetime, timedelta
from database import supabase
import schemas
from api.auth import get_current_user, check_admin
from uuid import uuid4

router = APIRouter()

@router.get("/", response_model=List[schemas.ClaimResponse])
async def get_my_claims(user: dict = Depends(get_current_user)):
    response = supabase.table("claims").select("*").eq("user_id", user["id"]).execute()
    return response.data

@router.get("/{claim_id}", response_model=schemas.ClaimResponse)
async def get_claim_detail(claim_id: str, user: dict = Depends(get_current_user)):
    response = supabase.table("claims").select("*").eq("id", claim_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Claim not found")
    
    claim = response.data[0]
    if claim["user_id"] != user["id"] and user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Access denied")
        
    return claim

@router.post("/", response_model=schemas.ClaimResponse)
async def create_claim(claim: schemas.ClaimCreate, user: dict = Depends(get_current_user)):
    response = supabase.table("claims").insert({
        "user_id": user["id"],
        "type": claim.type,
        "description": claim.description,
        "amount": float(claim.amount),
        "status": "pending"
    }).execute()
    
    if len(response.data) == 0:
        raise HTTPException(status_code=400, detail="Failed to create claim")
    return response.data[0]

@router.post("/{claim_id}/documents")
async def upload_document(
    claim_id: str, 
    file: UploadFile = File(...), 
    doc_type: str = Form(...),
    user: dict = Depends(get_current_user)
):
    claim_resp = supabase.table("claims").select("user_id").eq("id", claim_id).single().execute()
    if not claim_resp.data or (claim_resp.data["user_id"] != user["id"] and user["role"] != "admin"):
        raise HTTPException(status_code=403, detail="Not authorized to add documents to this claim")

    file_path = f"claims/{claim_id}/{uuid4()}_{file.filename}"
    file_content = await file.read()
    
    supabase.storage.from_("documents").upload(file_path, file_content)
    public_url = supabase.storage.from_("documents").get_public_url(file_path)
    
    db_response = supabase.table("documents").insert({
        "claim_id": claim_id,
        "file_url": public_url,
        "type": doc_type,
        "verified": False
    }).execute()
    
    return {"message": "Document uploaded successfully", "url": public_url}

@router.get("/{claim_id}/documents", response_model=List[schemas.DocumentResponse])
async def get_claim_documents(claim_id: str, user: dict = Depends(get_current_user)):
    # Verify access
    claim_resp = supabase.table("claims").select("user_id").eq("id", claim_id).single().execute()
    if not claim_resp.data:
        raise HTTPException(status_code=404, detail="Claim not found")
        
    if claim_resp.data["user_id"] != user["id"] and user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to view these documents")

    response = supabase.table("documents").select("*").eq("claim_id", claim_id).execute()
    return response.data

@router.get("/admin/all", response_model=List[schemas.ClaimResponse])
async def get_all_claims(user: dict = Depends(check_admin)):
    response = supabase.table("claims").select("*").execute()
    return response.data

@router.put("/{claim_id}/approve")
async def approve_claim(
    claim_id: str, 
    deadline_hours: int = 24,
    user: dict = Depends(check_admin)
):
    payment_deadline = datetime.utcnow() + timedelta(hours=deadline_hours)
    
    response = supabase.table("claims").update({
        "status": "approved",
        "approved_at": datetime.utcnow().isoformat(),
        "payment_deadline": payment_deadline.isoformat()
    }).eq("id", claim_id).execute()
    
    if not response.data:
        raise HTTPException(status_code=400, detail="Failed to approve claim")
    return response.data[0]

@router.put("/{claim_id}/reject")
async def reject_claim(claim_id: str, user: dict = Depends(check_admin)):
    response = supabase.table("claims").update({
        "status": "rejected"
    }).eq("id", claim_id).execute()
    
    if not response.data:
        raise HTTPException(status_code=400, detail="Failed to reject claim")
    return response.data[0]

@router.put("/{claim_id}/paid")
async def mark_as_paid(claim_id: str, payment_id: str, user: dict = Depends(check_admin)):
    # Correctly update the 'claims' table (not 'users')
    response = supabase.table("claims").update({
        "status": "paid",
        "payment_id": payment_id
    }).eq("id", claim_id).execute()
    
    if not response.data:
        raise HTTPException(status_code=400, detail="Database update failed for this claim ID")
    return response.data[0]

@router.post("/{claim_id}/pay")
async def pay_claim(claim_id: str, amount: float, user: dict = Depends(check_admin)):
    claim_response = supabase.table("claims").select("*").eq("id", claim_id).single().execute()
    claim = claim_response.data
    
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
        
    if not claim["payment_deadline"]:
        raise HTTPException(status_code=400, detail="Claim must be approved before payment")

    deadline = datetime.fromisoformat(claim["payment_deadline"])
    if datetime.utcnow() > deadline:
        pass

    payment_response = supabase.table("payments").insert({
        "claim_id": claim_id,
        "amount": amount,
        "status": "completed"
    }).execute()
    
    return {"message": "Payment successful", "payment": payment_response.data[0]}
