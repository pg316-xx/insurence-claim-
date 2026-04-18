from database import supabase
import sys

tables = ["users", "claims", "documents", "payments"]

print("--- TABLE VERIFICATION ---")
for t in tables:
    try:
        supabase.table(t).select("count", count="exact").limit(1).execute()
        print(f"Table '{t}': EXISTS")
    except Exception as e:
        print(f"Table '{t}': MISSING or ERROR ({str(e)})")

print("--- END VERIFICATION ---")
