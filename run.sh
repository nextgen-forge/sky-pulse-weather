#!/bin/bash
echo "================================"
echo "  SkyPulse Weather App"
echo "================================"
echo ""
echo "Installing dependencies..."
cd backend
pip install -r requirements.txt
echo ""
echo "Starting server..."
echo "Open your browser at: http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop."
echo ""
uvicorn main:app --host 0.0.0.0 --port 8000
