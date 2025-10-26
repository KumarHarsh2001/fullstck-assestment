# Transaction Webhook Service - Full Stack Application

Complete full-stack application with independent backend and frontend services.

## 📁 Project Structure

```
├── backend/          # Transaction Webhook API (Python/FastAPI)
│   ├── main.py       # FastAPI application
│   ├── requirements.txt
│   ├── README.md     # Complete backend documentation
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── env.example
│   ├── run.bat       # Windows run script
│   └── run.sh        # Linux/Mac run script
│
└── frontend/         # Voice Agent Analytics Dashboard (React/TypeScript)
    ├── src/          # React components
    ├── build/        # Production build
    ├── package.json
    ├── README.md     # Complete frontend documentation
    ├── Dockerfile
    ├── nginx.conf
    ├── env.example
    ├── run.bat       # Windows run script
    └── run.sh        # Linux/Mac run script
```

## 🎯 Overview

This repository contains **two independent projects**:

### Backend - Transaction Webhook Service
- **Location**: `backend/`
- **Technology**: Python, FastAPI, PostgreSQL, Redis
- **Purpose**: Receives transaction webhooks from payment processors
- **Port**: 8000
- **Documentation**: See [backend/README.md](backend/README.md)

### Frontend - Voice Agent Analytics Dashboard
- **Location**: `frontend/`
- **Technology**: React, TypeScript, Material-UI, Recharts
- **Purpose**: Interactive analytics dashboard for call analytics
- **Port**: 3000
- **Live URL**: https://cah-app.netlify.app/
- **Documentation**: See [frontend/README.md](frontend/README.md)

## 🚀 Quick Start

### Backend Only
```bash
cd backend
./run.bat          # Windows
./run.sh           # Linux/Mac
```
Access at: http://localhost:8000

### Frontend Only
```bash
cd frontend
./run.bat          # Windows
./run.sh           # Linux/Mac
```
Access at: http://localhost:3000

## 📖 Documentation

- **Backend Documentation**: [backend/README.md](backend/README.md)
- **Frontend Documentation**: [frontend/README.md](frontend/README.md)

## 🔑 Key Features

### Backend Features
- ✅ Fast webhook processing (< 500ms response)
- ✅ Background task processing
- ✅ Idempotency handling
- ✅ PostgreSQL database
- ✅ Redis caching
- ✅ Health monitoring

### Frontend Features
- ✅ Interactive analytics charts
- ✅ Call duration analysis
- ✅ Sad path analysis
- ✅ User data persistence with Supabase
- ✅ Custom data editing
- ✅ Modern dark theme UI

## 🌐 Deployment

- **Frontend**: Deployed at https://cah-app.netlify.app/
- **Backend**: Can be deployed on any cloud platform (AWS, GCP, Azure, Railway, etc.)
- Both services have Docker support for containerized deployment

## 📝 Notes

- **Backend and frontend are completely independent**
- Each has its own documentation and setup instructions
- Run them separately or together as needed
- Both have Docker support for easy deployment
- Frontend is production-ready and deployed
