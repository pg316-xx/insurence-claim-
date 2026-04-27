from database import supabase
import sys

try:
    print("--- USER PERMISSIONS AUDIT ---")
    res = supabase.table("users").select("email, role").execute()
    for user in res.data:
        print(f"Email: {user['email']} | Role: {user['role']}")
    print("--- END AUDIT ---")
except Exception as e:
    print(f"Error: {str(e)}")
