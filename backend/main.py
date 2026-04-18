from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api import claims, users, payments

app = FastAPI(title="Insurance Claim Management System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(claims.router, prefix="/claims", tags=["Claims"])
app.include_router(payments.router, tags=["Payments"])

@app.get("/")
async def root():
    return {"message": "Welcome to the Insurance Claim Management API"}
