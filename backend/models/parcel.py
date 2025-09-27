from sqlalchemy import Column, Integer, String, DateTime, Numeric, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from db import Base
import json

class Parcel(Base):
    """Model for storing FRA parcel data (without PostGIS geometry for now)"""
    __tablename__ = 'parcels'
    
    id = Column(Integer, primary_key=True, index=True)
    parcel_id = Column(String(100), unique=True, index=True)
    claim_id = Column(Integer, ForeignKey('claims.id'), nullable=False)
    
    # Location details
    state = Column(String(100), index=True)
    district = Column(String(100), index=True)
    block = Column(String(100))
    village = Column(String(100), index=True)
    
    # Parcel details
    survey_number = Column(String(100))
    area_hectares = Column(Numeric(10, 4))
    land_type = Column(String(100))
    land_classification = Column(String(100))
    
    # Store geometry as text for now (instead of PostGIS geometry)
    geometry_text = Column(Text, comment="GeoJSON or WKT geometry stored as text")
    
    # Timestamps
    created_date = Column(DateTime(timezone=True), server_default=func.now())
    updated_date = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Additional details
    boundaries = Column(Text)  # Store boundary descriptions
    remarks = Column(Text)
    
    # Relationships
    claim = relationship("Claim", back_populates="parcels")
    
    @property
    def geometry_geojson(self):
        """Convert geometry text to GeoJSON format"""
        if self.geometry_text:
            try:
                return json.loads(self.geometry_text)
            except:
                return None
        return None
    
    def __repr__(self):
        return f"<Parcel(id={self.id}, parcel_id='{self.parcel_id}', village='{self.village}')>"