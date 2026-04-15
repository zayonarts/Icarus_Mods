import urllib.request
import json
import re
import os

# Configuration
APP_ID = "1149460"  # ICARUS
STEAM_NEWS_API = f"https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/?appid={APP_ID}&count=5"
STATUS_FILE = "game_status.json"

def get_latest_week():
    try:
        # Fetch the latest 5 news items (to skip hotfixes)
        with urllib.request.urlopen(STEAM_NEWS_API) as response:
            data = json.loads(response.read().decode())
            
        news_items = data.get("appnews", {}).get("newsitems", [])
        
        # Regex to find "Week X" in the title
        week_pattern = re.compile(r"Week\s+(\d+)", re.IGNORECASE)
        
        for item in news_items:
            title = item.get("title", "")
            match = week_pattern.search(title)
            if match:
                week_number = match.group(1)
                print(f">>> Detected Current Game Week: {week_number}")
                return week_number
                
        print(">>> No 'Week' pattern found in latest news items.")
        return None
    except Exception as e:
        print(f">>> Error fetching Steam News: {e}")
        return None

def update_status():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    json_path = os.path.join(script_dir, STATUS_FILE)
    
    current_week = get_latest_week()
    if not current_week:
        return

    # Load existing status
    if os.path.exists(json_path):
        with open(json_path, 'r') as f:
            status_data = json.load(f)
    else:
        status_data = {}

    # Check if updated
    if status_data.get("latest_week") != current_week:
        status_data["latest_week"] = current_week
        # We could also store a timestamp
        with open(json_path, 'w') as f:
            json.dump(status_data, f, indent=4)
        print(f">>> game_status.json updated to Week {current_week}")
    else:
        print(f">>> game_status.json is already up to date (Week {current_week})")

if __name__ == "__main__":
    update_status()
