import asyncio
import logging
from io import BytesIO
from typing import List, Dict
import pytesseract
from pdf2image import convert_from_bytes
from PIL import Image
import tempfile
import os

logger = logging.getLogger(__name__)

# Configure Tesseract path if needed (Windows)
# Uncomment and adjust path as needed for your system
# pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

async def process_document(pdf_content: bytes) -> str:
    """
    Process PDF document using OCR to extract text
    
    Args:
        pdf_content: Raw PDF file bytes
        
    Returns:
        Extracted text from the document
    """
    try:
        logger.info("Starting OCR processing")
        
        # Convert PDF to images
        images = await pdf_to_images(pdf_content)
        logger.info(f"Converted PDF to {len(images)} images")
        
        # Extract text from each image
        all_text = []
        for i, image in enumerate(images):
            logger.info(f"Processing page {i + 1}/{len(images)}")
            text = await extract_text_from_image(image)
            all_text.append(text)
        
        # Combine all text
        extracted_text = "\n\n--- PAGE BREAK ---\n\n".join(all_text)
        
        logger.info(f"OCR completed. Extracted {len(extracted_text)} characters")
        return extracted_text
        
    except Exception as e:
        logger.error(f"Error in OCR processing: {e}")
        raise Exception(f"OCR processing failed: {str(e)}")

async def pdf_to_images(pdf_content: bytes) -> List[Image.Image]:
    """Convert PDF bytes to PIL Images"""
    try:
        # Run PDF conversion in thread pool to avoid blocking
        loop = asyncio.get_event_loop()
        images = await loop.run_in_executor(
            None,
            lambda: convert_from_bytes(
                pdf_content,
                dpi=300,
                fmt='jpeg',
                thread_count=2
            )
        )
        return images
        
    except Exception as e:
        logger.error(f"Error converting PDF to images: {e}")
        raise Exception(f"PDF conversion failed: {str(e)}")

async def extract_text_from_image(image: Image.Image) -> str:
    """Extract text from PIL Image using Tesseract OCR"""
    try:
        # Configure OCR settings for better accuracy
        custom_config = r'--oem 3 --psm 6 -l eng'
        
        # Run OCR in thread pool to avoid blocking
        loop = asyncio.get_event_loop()
        text = await loop.run_in_executor(
            None,
            lambda: pytesseract.image_to_string(image, config=custom_config)
        )
        
        # Clean up text
        cleaned_text = clean_text(text)
        return cleaned_text
        
    except Exception as e:
        logger.error(f"Error extracting text from image: {e}")
        return ""

def clean_text(text: str) -> str:
    """Clean and normalize extracted text"""
    if not text:
        return ""
    
    # Remove excessive whitespace
    lines = [line.strip() for line in text.split('\n')]
    lines = [line for line in lines if line]  # Remove empty lines
    
    # Join lines with single newline
    cleaned = '\n'.join(lines)
    
    # Replace multiple spaces with single space
    import re
    cleaned = re.sub(r' +', ' ', cleaned)
    
    return cleaned.strip()

async def process_image_file(image_content: bytes) -> str:
    """Process image file directly (for testing/debugging)"""
    try:
        image = Image.open(BytesIO(image_content))
        text = await extract_text_from_image(image)
        return text
    except Exception as e:
        logger.error(f"Error processing image file: {e}")
        raise Exception(f"Image processing failed: {str(e)}")