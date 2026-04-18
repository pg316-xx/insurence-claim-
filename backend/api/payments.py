from fastapi import APIRouter, Depends, HTTPException
from database import supabase
from api.auth import check_admin
import razorpay
import os
from pydantic import BaseModel

router = APIRouter(prefix="/payments", tags=["payments"])

class PaymentRequest(BaseModel):
    claim_id: str

@router.post("/create-order")
async def create_payment_order(req: PaymentRequest, user: dict = Depends(check_admin)):
    RZP_KEY_ID = os.getenv("RAZORPAY_KEY_ID")
    RZP_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET")
    
    if not RZP_KEY_ID:
        raise HTTPException(status_code=400, detail="Razorpay Keys missing in .env")

    # 1. Fetch Claim AND User UPI ID
    try:
        # Fetch claim
        claim_res = supabase.table("claims").select("*").eq("id", req.claim_id).single().execute()
        if not claim_res.data:
            raise HTTPException(status_code=404, detail="Claim not found")
        claim = claim_res.data

        # Fetch client's UPI ID (since it's not stored in 'claims' table)
        user_res = supabase.table("users").select("upi_id").eq("id", claim["user_id"]).single().execute()
        upi_id = user_res.data.get("upi_id") if user_res.data else "Not Provided"

    except Exception as db_err:
        print(f"DATABASE ERROR: {str(db_err)}")
        raise HTTPException(status_code=500, detail="Failed to fetch claim or user details")

    # 2. Create Real Razorpay Order
    try:
        client = razorpay.Client(auth=(RZP_KEY_ID, RZP_KEY_SECRET))
        amount_in_paise = int(float(claim["amount"]) * 100)
        
        order_data = {
            "amount": amount_in_paise,
            "currency": "INR",
            "receipt": f"rcpt_{claim['id'][:10]}",
            "notes": { 
                "claim_id": claim["id"], 
                "client_upi": upi_id 
            }
        }
        order = client.order.create(data=order_data)
        return {
            "order_id": order["id"],
            "amount": amount_in_paise,
            "currency": "INR",
            "key_id": RZP_KEY_ID
        }
    except Exception as rzp_err:
        print(f"RAZORPAY ERROR: {str(rzp_err)}")
        raise HTTPException(status_code=400, detail=f"Gatekeeper Rejection: {str(rzp_err)}")
