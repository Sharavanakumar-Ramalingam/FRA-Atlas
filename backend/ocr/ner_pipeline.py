import asyncio
import logging
import re
from typing import Dict, List, Any, Optional

logger = logging.getLogger(__name__)

class FRAEntityExtractor:
    """Named Entity Recognition for FRA documents using rule-based extraction"""
    
    def __init__(self):
        self.patterns = self._build_patterns()
    
    def _build_patterns(self) -> Dict[str, List[str]]:
        """Build regex patterns for entity extraction"""
        return {
            'person_names': [
                r'\b[A-Z][a-z]+ [A-Z][a-z]+(?:\s[A-Z][a-z]+)*\b',  # Name patterns
                r'(?:Shri|Smt|Sri|Dr)\s+[A-Z][a-z]+(?:\s[A-Z][a-z]+)*',
                r'S/o\s+[A-Z][a-z]+(?:\s[A-Z][a-z]+)*',
                r'D/o\s+[A-Z][a-z]+(?:\s[A-Z][a-z]+)*',
                r'W/o\s+[A-Z][a-z]+(?:\s[A-Z][a-z]+)*'
            ],
            'villages': [
                r'Village[:\s]+([A-Z][a-zA-Z\s]+?)(?:\s*,|\s*\.|\s*$)',
                r'Gram[:\s]+([A-Z][a-zA-Z\s]+?)(?:\s*,|\s*\.|\s*$)',
                r'(?:in|of)\s+village\s+([A-Z][a-zA-Z\s]+?)(?:\s*,|\s*\.|\s*$)'
            ],
            'districts': [
                r'District[:\s]+([A-Z][a-zA-Z\s]+?)(?:\s*,|\s*\.|\s*$)',
                r'(?:in|of)\s+district\s+([A-Z][a-zA-Z\s]+?)(?:\s*,|\s*\.|\s*$)'
            ],
            'states': [
                r'State[:\s]+([A-Z][a-zA-Z\s]+?)(?:\s*,|\s*\.|\s*$)',
                r'(?:in|of)\s+state\s+([A-Z][a-zA-Z\s]+?)(?:\s*,|\s*\.|\s*$)'
            ],
            'land_area': [
                r'(\d+(?:\.\d+)?)\s*(?:acres?|hectares?|sq\.?\s*(?:ft|feet|meters?|m))',
                r'Area[:\s]+(\d+(?:\.\d+)?)\s*(?:acres?|hectares?)',
                r'(\d+(?:\.\d+)?)\s*(?:acre|hectare)'
            ],
            'survey_numbers': [
                r'Survey\s+No\.?\s*[:\-]?\s*(\d+(?:/\d+)*)',
                r'S\.?\s*No\.?\s*[:\-]?\s*(\d+(?:/\d+)*)',
                r'Plot\s+No\.?\s*[:\-]?\s*(\d+(?:/\d+)*)'
            ],
            'dates': [
                r'\d{1,2}[/-]\d{1,2}[/-]\d{2,4}',
                r'\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{2,4}',
                r'(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{2,4}'
            ]
        }
    
    async def extract_entities(self, text: str) -> Dict[str, Any]:
        """Extract entities from text using rule-based patterns"""
        try:
            entities = {}
            
            for entity_type, patterns in self.patterns.items():
                matches = []
                for pattern in patterns:
                    found = re.findall(pattern, text, re.IGNORECASE)
                    if found:
                        matches.extend(found if isinstance(found[0], str) else [match[0] if isinstance(match, tuple) else match for match in found])
                
                # Clean and deduplicate matches
                clean_matches = list(set([match.strip() for match in matches if match.strip()]))
                if clean_matches:
                    entities[entity_type] = clean_matches
            
            # Additional processing for better accuracy
            entities = self._post_process_entities(entities, text)
            
            logger.info(f"Extracted entities: {entities}")
            return entities
            
        except Exception as e:
            logger.error(f"Entity extraction failed: {e}")
            return {}
    
    def _post_process_entities(self, entities: Dict[str, List[str]], text: str) -> Dict[str, Any]:
        """Post-process extracted entities for better accuracy"""
        processed = {}
        
        # Process person names
        if 'person_names' in entities:
            names = []
            for name in entities['person_names']:
                # Remove common prefixes for cleaner names
                clean_name = re.sub(r'^(?:Shri|Smt|Sri|Dr|S/o|D/o|W/o)\s*', '', name)
                if len(clean_name.split()) >= 2 and len(clean_name) > 3:
                    names.append(clean_name.title())
            processed['applicant_names'] = list(set(names))
        
        # Process locations
        for loc_type in ['villages', 'districts', 'states']:
            if loc_type in entities:
                locations = [loc.title().strip() for loc in entities[loc_type]]
                processed[loc_type.rstrip('s')] = list(set(locations))
        
        # Process land area
        if 'land_area' in entities:
            areas = []
            for area in entities['land_area']:
                try:
                    # Extract numeric value
                    num_match = re.search(r'(\d+(?:\.\d+)?)', str(area))
                    if num_match:
                        areas.append(float(num_match.group(1)))
                except:
                    continue
            if areas:
                processed['land_area_acres'] = max(areas)  # Take the largest area mentioned
        
        # Process survey numbers
        if 'survey_numbers' in entities:
            processed['survey_numbers'] = list(set(entities['survey_numbers']))
        
        # Process dates
        if 'dates' in entities:
            processed['mentioned_dates'] = list(set(entities['dates']))
        
        return processed

# Global instance
fra_extractor = FRAEntityExtractor()

async def extract_entities(text: str) -> Dict[str, Any]:
    """Extract FRA-relevant entities from text"""
    return await fra_extractor.extract_entities(text)