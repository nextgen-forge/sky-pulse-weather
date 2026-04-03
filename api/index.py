import sys
import os
import traceback
from fastapi import FastAPI
from fastapi.responses import JSONResponse

# Add the project root to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from backend.main import app
except Exception as e:
    app = FastAPI()
    @app.get("/{rest_of_path:path}")
    async def debug_error(rest_of_path: str = ""):
        return JSONResponse(
            status_code=500,
            content={
                "error": "Startup Failed",
                "message": str(e),
                "traceback": traceback.format_exc()
            }
        )
