import os
import sys
import json
import re
import urllib.request

def fetch_match(match_id):
    match_id = str(match_id).strip()
    url = f"https://www.fotmob.com/api/data/matchDetails?matchId={match_id}"
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Referer': 'https://www.fotmob.com/'
    }
    
    print(f"\n[1/3] FotMob-il ninnu match {match_id} download cheyyunnu...")
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode('utf-8'))
    except Exception as e:
        print(f"❌ Error fetching match data: {e}")
        return

    home = data.get("general", {}).get("homeTeam", {}).get("name", "Home")
    away = data.get("general", {}).get("awayTeam", {}).get("name", "Away")
    league_name = data.get("general", {}).get("leagueName", "") or data.get("general", {}).get("parentLeagueName", "")

    # League auto-detection (SPL / ISL / OTHERS)
    league_tag = "OTHERS"
    league_lower = league_name.lower()
    if any(k in league_lower for k in ["saudi", "spl", "roshn", "king cup", "super cup"]):
        league_tag = "SPL"
    elif any(k in league_lower for k in ["indian super league", "isl", "india"]):
        league_tag = "ISL"

    score_str = data.get("header", {}).get("status", {}).get("scoreStr", "0 - 0")
    title = f"{home} vs {away} ({score_str})"
    
    teams = data.get("header", {}).get("teams", [])
    home_logo = teams[0].get("imageUrl", "") if len(teams) > 0 else ""
    away_logo = teams[1].get("imageUrl", "") if len(teams) > 1 else ""
    match_date = data.get("general", {}).get("matchTimeUTCDate", "").split("T")[0]

    # File name format: home_away_id.json inside data/matches/
    clean_name = re.sub(r'[^\w\s-]', '', f"{home}_{away}").strip().lower()
    clean_name = re.sub(r'[-\s]+', '_', clean_name)
    file_name = f"{clean_name}_{match_id}.json"
    
    matches_dir = os.path.join("data", "matches")
    os.makedirs(matches_dir, exist_ok=True)
    file_path = os.path.join(matches_dir, file_name)

    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(data, f)
    print(f"[2/3] Match JSON safe aayi save cheythu -> {file_path}")

    # Update data/matches_list.json
    list_file = os.path.join("data", "matches_list.json")
    list_data = []
    if os.path.exists(list_file):
        try:
            with open(list_file, "r", encoding="utf-8") as f:
                list_data = json.load(f)
        except:
            list_data = []

    # Remove duplicate if already present
    list_data = [item for item in list_data if str(item.get("id")) != str(match_id)]

    # Append fresh fixture entry
    new_entry = {
        "id": str(match_id),
        "title": title,
        "league": league_tag,
        "season": "2026",
        "date": match_date,
        "homeTeam": home,
        "awayTeam": away,
        "homeLogo": home_logo,
        "awayLogo": away_logo,
        "file": f"data/matches/{file_name}"
    }
    list_data.append(new_entry)

    with open(list_file, "w", encoding="utf-8") as f:
        json.dump(list_data, f, indent=2)

    print(f"[3/3] data/matches_list.json successfully update aayi!")
    print(f"✨ Match '{title}' ({league_tag}) ippol ninte dashboard-il live aahn!\n")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        mid = sys.argv[1]
    else:
        mid = input("FotMob Match ID type cheyyuka: ").strip()
    fetch_match(mid)