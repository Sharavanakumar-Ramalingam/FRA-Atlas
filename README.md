# FRA Atlas 360 - Smart India Hackathon 2025

## Forest Rights Act Management System with WebGIS & DSS

FRA Atlas 360 is a comprehensive digital solution for managing Forest Rights Act (FRA) claims, documents, and providing decision support for Central Sector Scheme recommendations. Built for Smart India Hackathon 2025.

## 🚀 Features

### Core Functionality
- **Document Processing**: PDF upload with OCR (Tesseract) and NER (HuggingFace) for automatic text extraction and entity recognition
- **Claims Management**: Comprehensive FRA claims tracking and management system
- **WebGIS Visualization**: Interactive maps using React-Leaflet showing FRA parcels with PostGIS spatial data
- **Decision Support System (DSS)**: AI-enhanced recommendations for Central Sector Schemes (PM-KISAN, MGNREGA, Jal Jeevan Mission, DAJGUA)

### Technical Features
- **Spatial Data**: PostGIS geometry support for polygon and multipolygon parcel data
- **RESTful APIs**: FastAPI backend with comprehensive endpoint coverage
- **Real-time Processing**: Asynchronous document processing pipeline
- **Responsive UI**: Modern React frontend with Ant Design components
- **Docker Ready**: Complete containerized deployment setup

## 🏗️ Architecture

```
FRA Atlas 360/
├── backend/                 # FastAPI Python backend
│   ├── api/                # API routes
│   ├── models/             # SQLAlchemy models
│   ├── ocr/                # OCR & NER pipeline
│   ├── dss/                # Decision Support System
│   └── main.py             # Application entry point
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   └── services/       # API services
│   └── public/
├── sql/                    # Database initialization
└── docker-compose.yml      # Container orchestration
```

## 🛠️ Tech Stack

### Backend
- **FastAPI**: Modern Python web framework
- **PostgreSQL + PostGIS**: Spatial database
- **SQLAlchemy**: ORM with async support
- **Tesseract OCR**: Text extraction from PDFs
- **HuggingFace Transformers**: Named Entity Recognition
- **Scikit-learn**: ML models for recommendations

### Frontend  
- **React 18**: Modern React with hooks
- **Ant Design**: Professional UI components
- **React-Leaflet**: Interactive maps
- **Axios**: HTTP client for API calls

### DevOps
- **Docker & Docker Compose**: Containerization
- **PostGIS**: Spatial database extension
- **Redis**: Caching layer

## 📋 API Endpoints

### Health & Status
- `GET /health` - API health check

### Document Management
- `POST /api/v1/upload_doc` - Upload PDF, run OCR/NER
- `GET /api/v1/documents` - List processed documents

### Claims Management
- `GET /api/v1/claims` - Query FRA claims by filters
- Support for state, district, village, claim_type filtering

### Spatial Data
- `GET /api/v1/parcels` - Return GeoJSON of FRA parcels
- PostGIS geometry support for complex spatial queries

### Decision Support System
- `GET /api/v1/dss/recommend` - Get CSS scheme recommendations
- Context-aware recommendations based on claim data

## 🗄️ Database Schema

### Documents Table
- Stores uploaded PDFs with extracted text and entities
- JSON column for NER results

### Claims Table  
- FRA claim information with location hierarchy
- Links to documents and parcels
- Status tracking (pending, approved, rejected)

### Parcels Table
- PostGIS geometry for spatial boundaries
- Links to claims with survey numbers and area details

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Git

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd FRA
```

2. **Start with Docker Compose**
```bash
docker-compose up --build
```

This will start:
- PostgreSQL with PostGIS on port 5432
- FastAPI backend on port 8000
- React frontend on port 3000
- Redis cache on port 6379

3. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

### Manual Setup (Development)

1. **Backend Setup**
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

2. **Frontend Setup**
```bash
cd frontend
npm install
npm start
```

3. **Database Setup**
```bash
# Ensure PostgreSQL with PostGIS is running
# Database will be initialized automatically
```

## 📖 Usage Guide

### 1. Document Upload
- Navigate to "Upload Documents" 
- Upload PDF files containing FRA documents
- System automatically extracts text and entities
- View processing results and extracted information

### 2. Claims Management
- View all FRA claims in a searchable table
- Filter by state, district, village, status
- Track claim status and approval workflow
- Export data for reporting

### 3. GIS Visualization
- Interactive map showing FRA parcel boundaries
- Filter parcels by location
- Click parcels for detailed information
- Visual status indication (approved/pending/rejected)

### 4. DSS Recommendations
- Enter claim ID or location details
- Get personalized CSS scheme recommendations
- View eligibility match and required documents
- Priority-based scheme ranking

## 🔧 Configuration

### Environment Variables

Backend (`.env`):
```
DATABASE_URL=postgresql+asyncpg://postgres:password@postgres:5432/fra_atlas
DEBUG=true
```

Frontend (`.env`):
```
REACT_APP_API_URL=http://localhost:8000
```

### Database Configuration
- PostGIS extension automatically enabled
- Spatial indexes for performance
- State reference data pre-populated

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 📊 Performance Considerations

- **OCR Processing**: Large PDFs processed asynchronously
- **Spatial Queries**: Indexed geometry columns for fast GIS operations
- **Caching**: Redis for frequently accessed data
- **Pagination**: All list APIs support pagination

## 🔒 Security Features

- **Input Validation**: Pydantic models for request validation
- **File Upload Security**: PDF file type validation
- **Database Security**: Parameterized queries prevent SQL injection
- **CORS**: Configured for frontend domain

## 🎯 Smart India Hackathon 2025 Alignment

### Problem Statement Addressed
- Digitization of FRA processes
- Spatial data management for forest rights
- Decision support for beneficiary schemes
- Integration with government databases

### Innovation Highlights
- **AI-Powered OCR/NER**: Automated document processing
- **Spatial Analytics**: PostGIS-based geographic analysis
- **Decision Support**: Rule-based + AI recommendations
- **Integration Ready**: API-first design for government system integration

### Scalability Features
- **Microservices Architecture**: Containerized components
- **Database Optimization**: Spatial indexes and async queries
- **Caching Layer**: Redis for performance
- **Cloud Ready**: Docker containers for easy deployment

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is developed for Smart India Hackathon 2025. All rights reserved.

## 👥 Team

Built for Smart India Hackathon 2025 - Forest Rights Act Management System

## 📞 Support

For technical support and queries:
- Create an issue in the repository
- Check API documentation at `/docs`
- Review troubleshooting guide in the wiki

---

**FRA Atlas 360** - Empowering Forest Rights Management through Technology 🌲🗺️