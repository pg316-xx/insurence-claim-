import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv('c:/Users/Pawan/OneDrive/Desktop/insurence claim management system/backend/.env')

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def create_user(email, password, name, role):
    try:
        auth_res = supabase.auth.sign_up({
            "email": email,
            "password": password
        })
        
        if auth_res.user:
            supabase.table("users").insert({
                "id": auth_res.user.id,
                "name": name,
                "email": email,
                "role": role,
                "password": "SU_AUTH_MANAGED"
            }).execute()
            print(f"Successfully created {role}: {email}")
        else:
            print(f"Failed to create {email}")
            
    except Exception as e:
        print(f"Error creating {email}: {str(e)}")

if __name__ == "__main__":
    # Using more realistic emails
    create_user("pawan_admin@test.com", "pawan12345", "Admin User", "admin")
    create_user("pawan_client@test.com", "pawan12345", "Client User", "customer")
