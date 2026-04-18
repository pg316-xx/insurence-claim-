from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api import claims, users, payments # Correct utilities

app = FastAPI(title="Insurance Claim Management API")

# SECURE PRODUCTION CORS SETTINGS
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://insure-3uut.onrender.com",
    "https://insure-3uut.onrender.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Main Routers
app.include_router(claims.router)
app.include_router(users.router)
app.include_router(payments.router)

@app.get("/")
async def root():
    return {"message": "Insurance API is Live & Secure"}
