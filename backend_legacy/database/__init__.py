import os
from supabase import create_client, Client
from dotenv import load_dotenv

# Load local .env only if it exists (for local dev)
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ CRITICAL ERROR: SUPABASE_URL or SUPABASE_KEY is missing from environment variables!")
    # We allow the app to boot but it will fail on DB calls, allowing us to see logs.
    supabase = None
else:
    try:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("✅ Supabase Engine Initialized Successfully")
    except Exception as e:
        print(f"❌ Supabase Connection Failed: {str(e)}")
        supabase = None
