from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
import logging
import json
from datetime import datetime

from db import get_db
from models.document import Document
from models.claim import Claim
from models.parcel import Parcel
from ocr.gemini_ocr import process_document
from ocr.ner_pipeline import extract_entities
from dss.engine import get_recommendations

logger = logging.getLogger(__name__)
api_router = APIRouter()

@api_router.post("/upload_doc")
async def upload_document(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    """Upload PDF document, run OCR/NER, and store in database"""
    try:
        if not file.filename.lower().endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Only PDF files are supported")
        
        # Read file content
        content = await file.read()
        
        # Process document with OCR
        logger.info(f"Processing document: {file.filename}")
        extracted_text = await process_document(content)
        
        # Extract entities using NER
        entities = await extract_entities(extracted_text)
        
        # Create document record
        document = Document(
            filename=file.filename,
            content_type=file.content_type,
            file_size=len(content),
            extracted_text=extracted_text,
            entities=entities,
            upload_date=datetime.utcnow()
        )
        
        db.add(document)
        await db.commit()
        await db.refresh(document)
        
        logger.info(f"Document {file.filename} processed and saved with ID: {document.id}")
        
        return {
            "id": document.id,
            "filename": file.filename,
            "status": "processed",
            "entities_found": len(entities),
            "text_length": len(extracted_text)
        }
        
    except Exception as e:
        logger.error(f"Error processing document {file.filename}: {e}")
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Error processing document: {str(e)}")

@api_router.get("/documents")
async def list_documents(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: AsyncSession = Depends(get_db)
):
    """List all processed documents"""
    try:
        query = select(Document).offset(skip).limit(limit)
        result = await db.execute(query)
        documents = result.scalars().all()
        
        return [
            {
                "id": doc.id,
                "filename": doc.filename,
                "upload_date": doc.upload_date.isoformat(),
                "file_size": doc.file_size,
                "entities_count": len(doc.entities) if doc.entities else 0
            }
            for doc in documents
        ]
        
    except Exception as e:
        logger.error(f"Error listing documents: {e}")
        raise HTTPException(status_code=500, detail="Error retrieving documents")

@api_router.post("/claims")
async def create_claim(
    claimant_name: str = Form(...),
    claim_type: str = Form(...),
    state: str = Form(...),
    district: str = Form(...),
    village: str = Form(...),
    area_hectares: float = Form(...),
    document_id: Optional[int] = Form(None),
    db: AsyncSession = Depends(get_db)
):
    """Create a new FRA claim"""
    try:
        claim = Claim(
            claimant_name=claimant_name,
            claim_type=claim_type,
            status="pending",
            state=state,
            district=district,
            village=village,
            area_hectares=area_hectares,
            document_id=document_id
        )
        
        db.add(claim)
        await db.commit()
        await db.refresh(claim)
        
        logger.info(f"Claim created for {claimant_name} in {village}, {district}")
        
        return {
            "id": claim.id,
            "claimant_name": claim.claimant_name,
            "claim_type": claim.claim_type,
            "status": claim.status,
            "state": claim.state,
            "district": claim.district,
            "village": claim.village,
            "area_hectares": float(claim.area_hectares),
            "created_date": claim.created_date.isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error creating claim: {e}")
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating claim: {str(e)}")

@api_router.post("/claims/sample")
async def create_sample_claims(db: AsyncSession = Depends(get_db)):
    """Create sample FRA claims for testing"""
    try:
        sample_claims = [
            {
                "claimant_name": "Ravi Kumar",
                "claim_type": "Individual",
                "state": "Odisha",
                "district": "Mayurbhanj",
                "village": "Baripada",
                "area_hectares": 2.5
            },
            {
                "claimant_name": "Sita Devi",
                "claim_type": "Community",
                "state": "Jharkhand", 
                "district": "Ranchi",
                "village": "Bundu",
                "area_hectares": 5.0
            },
            {
                "claimant_name": "Ram Singh",
                "claim_type": "Individual",
                "state": "Madhya Pradesh",
                "district": "Balaghat",
                "village": "Kirnapur",
                "area_hectares": 3.2
            },
            {
                "claimant_name": "Maya Tribal Community",
                "claim_type": "Community",
                "state": "Gujarat",
                "district": "Sabarkantha", 
                "village": "Idar",
                "area_hectares": 8.7
            },
            {
                "claimant_name": "Arjun Patel",
                "claim_type": "Individual",
                "state": "Rajasthan",
                "district": "Udaipur",
                "village": "Gogunda",
                "area_hectares": 1.8
            }
        ]
        
        created_claims = []
        for claim_data in sample_claims:
            claim = Claim(
                claimant_name=claim_data["claimant_name"],
                claim_type=claim_data["claim_type"],
                status="pending",
                state=claim_data["state"],
                district=claim_data["district"],
                village=claim_data["village"],
                area_hectares=claim_data["area_hectares"]
            )
            
            db.add(claim)
            created_claims.append(claim_data)
        
        await db.commit()
        logger.info(f"Created {len(created_claims)} sample claims")
        
        return {
            "message": f"Successfully created {len(created_claims)} sample claims",
            "claims": created_claims
        }
        
    except Exception as e:
        logger.error(f"Error creating sample claims: {e}")
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating sample claims: {str(e)}")

@api_router.get("/claims")
async def get_claims(
    state: Optional[str] = Query(None),
    district: Optional[str] = Query(None),
    village: Optional[str] = Query(None),
    claim_type: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: AsyncSession = Depends(get_db)
):
    """Query FRA claims with filters"""
    try:
        query = select(Claim)
        
        # Apply filters
        if state:
            query = query.where(Claim.state.ilike(f"%{state}%"))
        if district:
            query = query.where(Claim.district.ilike(f"%{district}%"))
        if village:
            query = query.where(Claim.village.ilike(f"%{village}%"))
        if claim_type:
            query = query.where(Claim.claim_type.ilike(f"%{claim_type}%"))
            
        query = query.offset(skip).limit(limit)
        result = await db.execute(query)
        claims = result.scalars().all()
        
        return [
            {
                "id": claim.id,
                "claimant_name": claim.claimant_name,
                "claim_type": claim.claim_type,
                "status": claim.status,
                "state": claim.state,
                "district": claim.district,
                "village": claim.village,
                "area_hectares": float(claim.area_hectares) if claim.area_hectares else None,
                "created_date": claim.created_date.isoformat() if claim.created_date else None
            }
            for claim in claims
        ]
        
    except Exception as e:
        logger.error(f"Error querying claims: {e}")
        raise HTTPException(status_code=500, detail="Error retrieving claims")

@api_router.get("/parcels")
async def get_parcels(
    state: Optional[str] = Query(None),
    district: Optional[str] = Query(None),
    village: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """Return GeoJSON of FRA parcels"""
    try:
        query = select(Parcel)
        
        # Apply filters
        if state:
            query = query.where(Parcel.state.ilike(f"%{state}%"))
        if district:
            query = query.where(Parcel.district.ilike(f"%{district}%"))
        if village:
            query = query.where(Parcel.village.ilike(f"%{village}%"))
            
        result = await db.execute(query)
        parcels = result.scalars().all()
        
        # Convert to GeoJSON
        features = []
        for parcel in parcels:
            if parcel.geometry:
                # Convert PostGIS geometry to GeoJSON
                geom_dict = parcel.geometry_geojson
                features.append({
                    "type": "Feature",
                    "geometry": geom_dict,
                    "properties": {
                        "id": parcel.id,
                        "parcel_id": parcel.parcel_id,
                        "claim_id": parcel.claim_id,
                        "state": parcel.state,
                        "district": parcel.district,
                        "village": parcel.village,
                        "area_hectares": float(parcel.area_hectares) if parcel.area_hectares else None,
                        "land_type": parcel.land_type,
                        "survey_number": parcel.survey_number
                    }
                })
        
        return {
            "type": "FeatureCollection",
            "features": features
        }
        
    except Exception as e:
        logger.error(f"Error retrieving parcels: {e}")
        raise HTTPException(status_code=500, detail="Error retrieving parcel data")

@api_router.get("/dss/recommend")
async def get_dss_recommendations(
    claim_id: Optional[int] = Query(None),
    village: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    district: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """Get DSS recommendations for a claim or village"""
    try:
        # Validate inputs
        if not claim_id and not village:
            raise HTTPException(
                status_code=400, 
                detail="Either claim_id or village must be provided"
            )
        
        # Get claim data if claim_id provided
        claim_data = None
        if claim_id:
            query = select(Claim).where(Claim.id == claim_id)
            result = await db.execute(query)
            claim = result.scalar_one_or_none()
            if not claim:
                raise HTTPException(status_code=404, detail="Claim not found")
            claim_data = {
                "id": claim.id,
                "claimant_name": claim.claimant_name,
                "claim_type": claim.claim_type,
                "state": claim.state,
                "district": claim.district,
                "village": claim.village,
                "area_hectares": float(claim.area_hectares) if claim.area_hectares else None
            }
        
        # Get recommendations from DSS engine
        recommendations = await get_recommendations(
            claim_data=claim_data,
            village=village,
            state=state,
            district=district
        )
        
        return recommendations
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting DSS recommendations: {e}")
        raise HTTPException(status_code=500, detail="Error generating recommendations")