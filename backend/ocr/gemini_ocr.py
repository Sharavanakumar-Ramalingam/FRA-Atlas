import asyncio
import logging
import io
import os
from PIL import Image
import google.generativeai as genai
from pdf2image import convert_from_bytes
from typing import List, Dict, Any

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configure Gemini API
API_KEY = 'AIzaSyC7kcDQFkHQTbJaJtj2JZ8zVaDHdA3Li-E'
genai.configure(api_key=API_KEY)

class GeminiOCRProcessor:
    """OCR processor using Google Gemini Vision API"""
    
    def __init__(self):
        self.model = genai.GenerativeModel(model_name="gemini-1.5-pro")
        self.ocr_prompt = """
        Extract all text content from this document image. Please:
        1. Extract ALL visible text accurately, including handwritten text
        2. Maintain the original structure and formatting where possible
        3. Include names, addresses, dates, numbers, and any other text
        4. If the document appears to be related to Forest Rights Act (FRA), pay special attention to:
           - Applicant names and family details
           - Village/District/State information
           - Land area measurements
           - Survey numbers
           - Dates and reference numbers
           - Any government scheme details
        5. Return only the extracted text content, no explanations or formatting markers
        
        Document text:
        """
    
    async def extract_text_from_image(self, image_bytes: bytes) -> str:
        """Extract text from a single image using Gemini Vision"""
        try:
            # Convert bytes to PIL Image for Gemini
            image = Image.open(io.BytesIO(image_bytes))
            
            # Use Gemini to extract text
            response = await asyncio.to_thread(
                self.model.generate_content, 
                [self.ocr_prompt, image]
            )
            
            extracted_text = response.text.strip()
            logger.info(f"Gemini OCR extracted {len(extracted_text)} characters")
            return extracted_text
            
        except Exception as e:
            logger.error(f"Gemini OCR failed: {e}")
            # Fallback to basic text return
            return f"OCR extraction failed: {str(e)}"
    
    async def process_pdf_pages(self, pdf_bytes: bytes) -> List[str]:
        """Convert PDF pages to images and extract text from each"""
        try:
            # Convert PDF to images
            images = await asyncio.to_thread(convert_from_bytes, pdf_bytes)
            logger.info(f"Converted PDF to {len(images)} images")
            
            # Extract text from each page
            page_texts = []
            for i, image in enumerate(images):
                logger.info(f"Processing page {i+1}/{len(images)}")
                
                # Convert PIL image to bytes
                img_byte_arr = io.BytesIO()
                image.save(img_byte_arr, format='PNG')
                img_bytes = img_byte_arr.getvalue()
                
                # Extract text using Gemini
                text = await self.extract_text_from_image(img_bytes)
                page_texts.append(text)
                
                # Add a small delay to respect API limits
                await asyncio.sleep(0.5)
            
            return page_texts
            
        except Exception as e:
            logger.error(f"PDF processing failed: {e}")
            return [f"PDF processing failed: {str(e)}"]

# Global instance
gemini_ocr = GeminiOCRProcessor()

async def process_document(pdf_content: bytes) -> str:
    """
    Process PDF document using Google Gemini Vision API OCR
    
    Args:
        pdf_content: Raw PDF file bytes
        
    Returns:
        Extracted text from the document
    """
    try:
        logger.info("Starting Gemini Vision OCR extraction")
        
        # Process all pages
        page_texts = await gemini_ocr.process_pdf_pages(pdf_content)
        
        # Combine all pages
        full_text = "\n\n--- PAGE BREAK ---\n\n".join(page_texts)
        
        logger.info(f"OCR completed. Total text length: {len(full_text)} characters")
        return full_text
        
    except Exception as e:
        logger.error(f"OCR extraction failed: {e}")
        return f"OCR extraction failed: {str(e)}"

async def extract_text_from_image_file(image_bytes: bytes) -> str:
    """
    Extract text from image file using Google Gemini Vision API
    
    Args:
        image_bytes: Image file content as bytes
        
    Returns:
        Extracted text content
    """
    try:
        logger.info("Starting Gemini Vision OCR for image")
        return await gemini_ocr.extract_text_from_image(image_bytes)
        
    except Exception as e:
        logger.error(f"Image OCR extraction failed: {e}")
        return f"Image OCR extraction failed: {str(e)}"