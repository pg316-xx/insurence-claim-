from database import supabase
import sys

try:
    print("Attempting to connect to Supabase...")
    # Try a simple select from users
    res = supabase.table("users").select("count", count="exact").execute()
    print("✅ Connection Successful!")
    print(f"Database response: {res}")
except Exception as e:
    print("❌ CONNECTION FAILED!")
    print(f"Error details: {str(e)}")
    sys.exit(1)
