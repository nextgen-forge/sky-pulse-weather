from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os

# Vercel serverless environments have a read-only file system EXCEPT for /tmp.
if os.environ.get("VERCEL") or os.environ.get("AWS_EXECUTION_ENV"):
    DATABASE_URL = "sqlite:////tmp/weather.db"
else:
    # Try local write, if we can't write here (due to permissions), fallback to /tmp
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    DATABASE_URL = f"sqlite:///{os.path.join(BASE_DIR, 'weather.db')}"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
