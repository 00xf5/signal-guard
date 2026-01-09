import requests
import json
import sys

# Configuration
API_URL = "https://app.risksignal.name.ng/api/scan" # Production URL
DEFAULT_KEY = "7166c564c535dd419a0c3f10" # The key we saw in Supabase
TEST_IP = "8.8.8.8"

def test_signal_api(api_key, target_ip):
    print(f"\n--- Signal Guard API Test ---")
    print(f"Target IP: {target_ip}")
    print(f"API Key  : {api_key[:4]}...{api_key[-4:]}")
    print("-" * 30)

    headers = {
        "x-api-key": api_key,
        "Content-Type": "application/json"
    }
    
    params = {
        "ip": target_ip
    }

    try:
        # Use the local dev server or production URL
        response = requests.get(API_URL, headers=headers, params=params)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("\n[SUCCESS] Response Data:")
            print(json.dumps(data, indent=2))
            
            # Quota Check
            quota = data.get("quota", {})
            print(f"\nQuota Remaining: {quota.get('remaining')}/{quota.get('limit')}")
            
        elif response.status_code == 401:
            print("\n[ERROR] Unauthorized: Invalid API Key")
        elif response.status_code == 429:
            print("\n[ERROR] Quota Exhausted: You have reached your 500-check limit")
        else:
            print(f"\n[ERROR] Request failed: {response.text}")

    except Exception as e:
        print(f"\n[CRITICAL] Could not connect to API: {e}")
        print("Tip: Make sure your local Vercel dev server is running (vercel dev)")

if __name__ == "__main__":
    key = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_KEY
    ip = sys.argv[2] if len(sys.argv) > 2 else TEST_IP
    
    test_signal_api(key, ip)
