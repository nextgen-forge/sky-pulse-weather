from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class WeatherResponse(BaseModel):
    city: str
    country: str
    temp: float
    feels_like: float
    humidity: int
    wind_speed: float
    description: str
    icon: str
    sunrise: int
    sunset: int

class DayForecast(BaseModel):
    date: str
    day_name: str
    min_temp: float
    max_temp: float
    description: str
    icon: str
    humidity: int

class ForecastResponse(BaseModel):
    city: str
    forecast: list[DayForecast]

class HistoryRecord(BaseModel):
    id: int
    city: str
    temp: Optional[float]
    description: Optional[str]
    searched_at: datetime

    class Config:
        from_attributes = True
