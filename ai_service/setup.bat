@echo off
echo Setting up AI Recommendation Microservice...

:: Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Python is not installed. Please install Python 3.9+ to run the AI service.
    exit /b 1
)

:: Create Virtual Environment if it doesn't exist
if not exist "venv\Scripts\activate.bat" (
    echo Creating virtual environment...
    python -m venv venv
)

:: Activate and install requirements
echo Activating virtual environment and installing dependencies...
call venv\Scripts\activate.bat
pip install -r requirements.txt

echo.
echo Setup Complete! Starting FastAPI Server...
echo The server will run on http://localhost:8000
echo.

uvicorn main:app --host 0.0.0.0 --port 8000 --reload
