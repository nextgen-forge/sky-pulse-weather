import sys
import os
import traceback
from fastapi import FastAPI
from fastapi.responses import JSONResponse

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

app = FastAPI()

try:
    from backend.main import app as backend_app
    app.mount("/", backend_app)
except Exception as e:
    err_trace = traceback.format_exc()
    @app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH", "TRACE"])
    async def handle_crash(path: str):
        return JSONResponse(
            status_code=500,
            content={
                "detail": f"Backend Import Failed: {str(e)}\n\n{err_trace}"
            }
        )
