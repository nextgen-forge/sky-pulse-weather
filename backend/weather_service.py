import requests
import os
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("OWM_API_KEY", "")
BASE_URL = "https://api.openweathermap.org/data/2.5"

WEEKDAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]

def fetch_current(city: str):
    if not API_KEY:
        raise ValueError("Missing OpenWeatherMap API Key in Environment Variables.")
    try:
        r = requests.get(
            f"{BASE_URL}/weather",
            params={"q": city, "appid": API_KEY, "units": "metric"},
            timeout=10
        )
        if r.status_code != 200:
            return None
        d = r.json()
        return {
            "city": d["name"],
            "country": d["sys"]["country"],
            "temp": round(d["main"]["temp"], 1),
            "feels_like": round(d["main"]["feels_like"], 1),
            "humidity": d["main"]["humidity"],
            "wind_speed": round(d["wind"]["speed"], 1),
            "description": d["weather"][0]["description"].title(),
            "icon": d["weather"][0]["icon"],
            "sunrise": d["sys"]["sunrise"],
            "sunset": d["sys"]["sunset"],
        }
    except Exception:
        return None

def fetch_forecast(city: str):
    if not API_KEY:
        raise ValueError("Missing OpenWeatherMap API Key in Environment Variables.")
    try:
        r = requests.get(
            f"{BASE_URL}/forecast",
            params={"q": city, "appid": API_KEY, "units": "metric", "cnt": 56},
            timeout=10
        )
        if r.status_code != 200:
            return None
        data = r.json()
        days = {}
        for item in data["list"]:
            date = item["dt_txt"][:10]
            if date not in days:
                dt = datetime.strptime(date, "%Y-%m-%d")
                days[date] = {
                    "date": date,
                    "day_name": WEEKDAYS[dt.weekday()],
                    "min_temp": item["main"]["temp_min"],
                    "max_temp": item["main"]["temp_max"],
                    "description": item["weather"][0]["description"].title(),
                    "icon": item["weather"][0]["icon"],
                    "humidity": item["main"]["humidity"],
                }
            else:
                days[date]["min_temp"] = min(days[date]["min_temp"], item["main"]["temp_min"])
                days[date]["max_temp"] = max(days[date]["max_temp"], item["main"]["temp_max"])

        forecast = []
        for d in list(days.values())[:7]:
            d["min_temp"] = round(d["min_temp"], 1)
            d["max_temp"] = round(d["max_temp"], 1)
            forecast.append(d)

        return {"city": data["city"]["name"], "forecast": forecast}
    except Exception:
        return None
