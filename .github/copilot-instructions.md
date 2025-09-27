# FRA Atlas 360 - Project Instructions

## Project Overview
FRA Atlas 360 is a Smart India Hackathon 2025 project for Forest Rights Act (FRA) management using WebGIS technology.

## Tech Stack
- **Backend**: FastAPI (Python)
- **Database**: PostgreSQL + PostGIS
- **Frontend**: React + Leaflet for WebGIS visualization
- **Data Processing**: OCR (Tesseract/TrOCR) + NER (HuggingFace)
- **AI/ML**: CNN/Random Forest for asset mapping
- **DSS**: Rule-based + AI-enhanced recommendations

## Project Structure
- `backend/` - FastAPI application
- `frontend/` - React application
- `docker-compose.yml` - Container orchestration
- Database schema supports FRA documents, claims, and spatial parcels

## Key APIs
- `/health` - Health check
- `/api/v1/upload_doc` - Upload PDF, run OCR/NER
- `/api/v1/documents` - List processed documents
- `/api/v1/claims` - Query FRA claims
- `/api/v1/parcels` - Return GeoJSON parcels
- `/api/v1/dss/recommend` - DSS recommendations

## Development Notes
- Use PostGIS geometry types for spatial data
- Modular code structure with clean separation
- Docker-ready with PostGIS + FastAPI containers
- Production-ready code standards

## Project Status
✅ Project Requirements Clarified - FRA Atlas 360 for Smart India Hackathon 2025
✅ Scaffold the Project - Complete backend and frontend structure created
✅ Customize the Project - All components implemented with production-ready code  
✅ Install Required Extensions - No extensions needed for this project
✅ Compile the Project - Dependencies installed successfully
✅ Create and Run Task - Tasks configured for backend/frontend/docker
✅ Launch the Project - Ready to launch with tasks.json
✅ Ensure Documentation is Complete - Complete README and project documentation