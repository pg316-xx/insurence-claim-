from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from decimal import Decimal
from enum import Enum

class UserRole(str, Enum):
    ADMIN = "admin"
    AGENT = "agent"
    CUSTOMER = "customer"

class ClaimStatus(str, Enum):
    PENDING = "pending"
    UNDER_REVIEW = "under_review"
    APPROVED = "approved"
    REJECTED = "rejected"
    PAID = "paid"

class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: UserRole = UserRole.CUSTOMER
    upi_id: Optional[str] = "not_provided"

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True

class ClaimBase(BaseModel):
    type: str
    description: Optional[str] = None
    amount: Decimal

class ClaimCreate(ClaimBase):
    pass

class ClaimUpdate(BaseModel):
    status: Optional[ClaimStatus] = None
    payment_deadline: Optional[datetime] = None

class ClaimResponse(ClaimBase):
    id: str
    user_id: str
    status: ClaimStatus
    approved_at: Optional[datetime] = None
    payment_deadline: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True

class DocumentResponse(BaseModel):
    id: str
    claim_id: str
    file_url: str
    type: str
    verified: bool
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    name: str

class TokenData(BaseModel):
    user_id: Optional[str] = None
    role: Optional[str] = None
