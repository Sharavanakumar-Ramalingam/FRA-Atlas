import requests
import json

# Test the DSS API endpoint
url = "http://localhost:8000/api/v1/dss/recommend"
params = {
    "village": "Devgadh",
    "district": "Banswara", 
    "state": "Rajasthan"
}

try:
    response = requests.get(url, params=params)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
except Exception as e:
    print(f"Error: {e}")