from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .database import SessionLocal, engine
from . import models
from . import weather_service
from . import schemas

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Weather Forecast API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Skip serving frontend from backend in Vercel.
# Vercel's vercel.json handles routing for /static and / (index.html).

@app.get("/weather/{city}", response_model=schemas.WeatherResponse)
def get_weather(city: str):
    db = SessionLocal()
    try:
        data = weather_service.fetch_current(city)
        if not data:
            raise HTTPException(status_code=404, detail=f"City '{city}' not found.")
        
        record = models.SearchHistory(city=data["city"], temp=data["temp"], description=data["description"])
        db.add(record)
        db.commit()
        return data
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@app.get("/forecast/{city}", response_model=schemas.ForecastResponse)
def get_forecast(city: str):
    try:
        data = weather_service.fetch_forecast(city)
        if not data:
            raise HTTPException(status_code=404, detail=f"City '{city}' not found.")
        return data
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/history", response_model=list[schemas.HistoryRecord])
def get_history():
    db = SessionLocal()
    records = db.query(models.SearchHistory).order_by(
        models.SearchHistory.id.desc()).limit(10).all()
    db.close()
    return records

@app.delete("/history")
def clear_history():
    db = SessionLocal()
    db.query(models.SearchHistory).delete()
    db.commit()
    db.close()
    return {"message": "History cleared"}
