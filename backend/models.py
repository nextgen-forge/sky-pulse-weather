from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime
from .database import Base

class SearchHistory(Base):
    __tablename__ = "searches"

    id          = Column(Integer, primary_key=True, index=True)
    city        = Column(String, nullable=False)
    temp        = Column(Float)
    description = Column(String)
    searched_at = Column(DateTime, default=datetime.utcnow)
