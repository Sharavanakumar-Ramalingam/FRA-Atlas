from sqlalchemy import Column, Integer, String, DateTime, Text, Numeric, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from db import Base

class Claim(Base):
    """Model for storing FRA claims"""
    __tablename__ = 'claims'
    
    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey('documents.id'), nullable=True)
    claim_number = Column(String(100), unique=True, index=True)
    claimant_name = Column(String(255), nullable=False)
    claim_type = Column(String(100))  # Individual, Community, etc.
    status = Column(String(50), default='pending')  # pending, approved, rejected
    
    # Location details
    state = Column(String(100), index=True)
    district = Column(String(100), index=True)
    block = Column(String(100))
    village = Column(String(100), index=True)
    
    # Claim details
    area_hectares = Column(Numeric(10, 4))
    land_type = Column(String(100))  # forest, agricultural, etc.
    survey_number = Column(String(100))
    
    # Timestamps
    created_date = Column(DateTime(timezone=True), server_default=func.now())
    updated_date = Column(DateTime(timezone=True), onupdate=func.now())
    claim_date = Column(DateTime(timezone=True))
    
    # Additional details
    family_members = Column(Integer)
    remarks = Column(Text)
    
    # Relationships
    document = relationship("Document", back_populates="claims")
    parcels = relationship("Parcel", back_populates="claim")
    
    def __repr__(self):
        return f"<Claim(id={self.id}, claimant='{self.claimant_name}', village='{self.village}')>"

# Add back reference to Document model
from models.document import Document
Document.claims = relationship("Claim", back_populates="document")