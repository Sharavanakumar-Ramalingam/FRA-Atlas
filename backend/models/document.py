from sqlalchemy import Column, Integer, String, DateTime, Text, JSON
from sqlalchemy.sql import func
from db import Base

class Document(Base):
    """Model for storing FRA documents and their processed content"""
    __tablename__ = 'documents'
    
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=False)
    content_type = Column(String(100))
    file_size = Column(Integer)
    extracted_text = Column(Text)
    entities = Column(JSON)  # Store NER results as JSON
    upload_date = Column(DateTime(timezone=True), server_default=func.now())
    processing_status = Column(String(50), default='pending')
    
    def __repr__(self):
        return f"<Document(id={self.id}, filename='{self.filename}')>"