from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api import claims, users, payments

app = FastAPI(title="Insurance Claim Management API")

# SECURE PRODUCTION CORS SETTINGS
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://insure-3uut.onrender.com"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Main Routers with proper prefixes for frontend compatibility
app.include_router(claims.router, prefix="/claims", tags=["claims"])
app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(payments.router, prefix="/payments", tags=["payments"])

@app.get("/")
async def root():
    return {"message": "Insurance API is Live & Secure"}
