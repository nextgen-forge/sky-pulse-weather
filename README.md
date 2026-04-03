# SkyPulse — Weather Forecast App
### Built with FastAPI · SQLite · Vanilla JS

A beautiful, shareable weather forecast app with current weather + 7-day forecast.

---

## Features
- Current weather with temperature, humidity, wind, sunrise/sunset
- 7-day forecast with icons
- Search history saved to SQLite database
- Dark / Light mode toggle
- °C / °F unit toggle
- Geolocation — detect your city automatically
- Shareable URLs — share `?city=Hyderabad` with friends
- One-click share button (copies link or uses native share)

---

## Quick Start (3 steps)

### Step 1 — Get a FREE API Key
1. Go to https://openweathermap.org/api
2. Sign up for a free account
3. Go to **API Keys** tab and copy your key

### Step 2 — Add your API key
Open `backend/.env` and replace the placeholder:
```
OWM_API_KEY=paste_your_key_here
```
> Note: New keys take ~10 minutes to activate after signup.

### Step 3 — Run the app

**Windows:**
```
run_windows.bat
```

**Mac / Linux:**
```bash
chmod +x run.sh
./run.sh
```

Then open your browser at: **http://localhost:8000**

---

## Manual Setup (if scripts don't work)

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

---

## Share with Friends

**Option A — Same WiFi network:**
Find your local IP (run `ipconfig` on Windows or `ifconfig` on Mac/Linux)
Share: `http://YOUR_IP:8000`

**Option B — Internet (free):**
Install ngrok: https://ngrok.com/download
```bash
ngrok http 8000
```
Share the ngrok URL with anyone in the world!

**Option C — Deploy permanently (free):**
- Backend: https://railway.app or https://render.com
- Frontend is served by FastAPI automatically

---

## Project Structure
```
weather-app/
├── backend/
│   ├── main.py            FastAPI routes
│   ├── database.py        SQLite connection
│   ├── models.py          Database models
│   ├── schemas.py         API response schemas
│   ├── weather_service.py OpenWeatherMap API calls
│   ├── requirements.txt
│   └── .env               ← Put your API key here
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── app.js
├── run.sh                 Mac/Linux launcher
└── run_windows.bat        Windows launcher
```

---

## API Endpoints
| Method | URL | Description |
|--------|-----|-------------|
| GET | `/weather/{city}` | Current weather |
| GET | `/forecast/{city}` | 7-day forecast |
| GET | `/history` | Last 10 searches |
| DELETE | `/history` | Clear history |
| GET | `/docs` | Interactive API docs (FastAPI) |

---

Made with FastAPI + SQLite + OpenWeatherMap
