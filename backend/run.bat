@echo off
REM Backend Run Script for Windows
echo Starting Backend Services...
docker-compose up -d
echo.
echo Backend is running at: http://localhost:8000
echo API Documentation: http://localhost:8000/docs
echo.
echo To stop services: docker-compose down
pause
