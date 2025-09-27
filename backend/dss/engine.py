import asyncio
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime

logger = logging.getLogger(__name__)

class DSSEngine:
    """Decision Support System for FRA claims and CSS scheme recommendations"""
    
    def __init__(self):
        self.css_schemes = self._initialize_css_schemes()
        self.rules = self._initialize_rules()
    
    def _initialize_css_schemes(self) -> Dict[str, Dict]:
        """Initialize Central Sector Schemes database"""
        return {
            "PM_KISAN": {
                "name": "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",
                "description": "Income support to farmer families",
                "eligibility": {
                    "land_holding": "up_to_2_hectares",
                    "beneficiary_type": "farmer",
                    "documentation": ["land_records", "aadhaar", "bank_account"]
                },
                "benefits": "₹6,000 per year in 3 installments",
                "ministry": "Agriculture & Farmers Welfare",
                "priority": 9
            },
            "MGNREGA": {
                "name": "MGNREGA (Mahatma Gandhi National Rural Employment Guarantee Act)",
                "description": "Employment guarantee scheme",
                "eligibility": {
                    "location": "rural",
                    "beneficiary_type": "adult_household_member",
                    "documentation": ["job_card", "aadhaar"]
                },
                "benefits": "100 days guaranteed employment per household",
                "ministry": "Rural Development",
                "priority": 8
            },
            "JAL_JEEVAN_MISSION": {
                "name": "Jal Jeevan Mission",
                "description": "Providing tap water connection to every household",
                "eligibility": {
                    "location": "rural",
                    "water_connection": "none_or_inadequate",
                    "documentation": ["household_survey"]
                },
                "benefits": "Tap water connection with assured quality",
                "ministry": "Jal Shakti",
                "priority": 7
            },
            "DAJGUA": {
                "name": "Development of Antyodaya and DAJGUA",
                "description": "Livelihood support for rural poor",
                "eligibility": {
                    "category": ["SC", "ST", "OBC", "minority"],
                    "economic_status": "below_poverty_line",
                    "documentation": ["bpl_card", "caste_certificate"]
                },
                "benefits": "Livelihood support and skill development",
                "ministry": "Rural Development",
                "priority": 6
            },
            "PMAY_GRAMIN": {
                "name": "Pradhan Mantri Awaas Yojana - Gramin",
                "description": "Housing for rural poor",
                "eligibility": {
                    "housing_status": "houseless_or_inadequate",
                    "location": "rural",
                    "economic_status": "below_poverty_line"
                },
                "benefits": "Financial assistance for house construction",
                "ministry": "Rural Development",
                "priority": 8
            },
            "PMFBY": {
                "name": "Pradhan Mantri Fasal Bima Yojana",
                "description": "Crop insurance scheme",
                "eligibility": {
                    "beneficiary_type": "farmer",
                    "crop_cultivation": "required",
                    "documentation": ["land_records", "crop_details"]
                },
                "benefits": "Crop insurance coverage",
                "ministry": "Agriculture & Farmers Welfare",
                "priority": 7
            }
        }
    
    def _initialize_rules(self) -> Dict[str, Any]:
        """Initialize DSS rules"""
        return {
            "eligibility_rules": {
                "tribal_area": {
                    "high_priority": ["DAJGUA", "MGNREGA", "JAL_JEEVAN_MISSION"],
                    "medium_priority": ["PM_KISAN", "PMAY_GRAMIN"],
                    "applicable": ["PMFBY"]
                },
                "forest_rights_approved": {
                    "high_priority": ["PM_KISAN", "PMFBY"],
                    "medium_priority": ["MGNREGA", "PMAY_GRAMIN"],
                    "applicable": ["JAL_JEEVAN_MISSION", "DAJGUA"]
                },
                "agricultural_land": {
                    "high_priority": ["PM_KISAN", "PMFBY"],
                    "medium_priority": ["MGNREGA"],
                    "applicable": ["JAL_JEEVAN_MISSION", "PMAY_GRAMIN"]
                }
            },
            "state_specific_rules": {
                "default": {
                    "multiplier": 1.0,
                    "additional_schemes": []
                }
            }
        }

# Global DSS instance
dss_engine = DSSEngine()

async def get_recommendations(
    claim_data: Optional[Dict] = None,
    village: Optional[str] = None,
    state: Optional[str] = None,
    district: Optional[str] = None
) -> Dict[str, Any]:
    """
    Get DSS recommendations for CSS schemes
    
    Args:
        claim_data: FRA claim information
        village: Village name
        state: State name
        district: District name
        
    Returns:
        Dictionary with recommendations
    """
    try:
        logger.info(f"Generating DSS recommendations for village={village}, state={state}")
        
        # Analyze context
        context = await _analyze_context(claim_data, village, state, district)
        
        # Apply rules to get recommendations
        recommendations = await _apply_rules(context)
        
        # Rank and prioritize schemes
        ranked_schemes = await _rank_schemes(recommendations, context)
        
        result = {
            "context": context,
            "recommendations": ranked_schemes,
            "summary": await _generate_summary(ranked_schemes, context),
            "generated_at": datetime.utcnow().isoformat()
        }
        
        logger.info(f"Generated {len(ranked_schemes)} scheme recommendations")
        return result
        
    except Exception as e:
        logger.error(f"Error generating DSS recommendations: {e}")
        raise Exception(f"DSS recommendation failed: {str(e)}")

async def _analyze_context(
    claim_data: Optional[Dict],
    village: Optional[str],
    state: Optional[str],
    district: Optional[str]
) -> Dict[str, Any]:
    """Analyze the context for recommendation generation"""
    
    context = {
        "location": {
            "state": state,
            "district": district,
            "village": village,
            "is_tribal_area": await _is_tribal_area(state, district),
            "is_forest_area": True  # Assumed since it's FRA
        },
        "claim_info": {},
        "demographic": {
            "rural": True,
            "tribal_population": True
        },
        "economic": {
            "agriculture_dependent": True,
            "below_poverty_line": True  # Assumed for FRA claimants
        }
    }
    
    if claim_data:
        context["claim_info"] = {
            "claim_type": claim_data.get("claim_type"),
            "area_hectares": claim_data.get("area_hectares"),
            "status": "pending",  # From claim data
            "has_agricultural_land": claim_data.get("area_hectares", 0) > 0
        }
        
        # Determine if it's agricultural land based on area
        area = claim_data.get("area_hectares", 0)
        if area and area <= 2:
            context["economic"]["small_farmer"] = True
        elif area and area <= 5:
            context["economic"]["medium_farmer"] = True
    
    return context

async def _is_tribal_area(state: Optional[str], district: Optional[str]) -> bool:
    """Check if location is in tribal area (simplified logic)"""
    # In a real system, this would check against a database of scheduled areas
    tribal_states = [
        "Jharkhand", "Chhattisgarh", "Odisha", "Madhya Pradesh",
        "Gujarat", "Rajasthan", "Andhra Pradesh", "Telangana",
        "Maharashtra", "West Bengal", "Assam", "Meghalaya",
        "Tripura", "Mizoram", "Manipur", "Nagaland", "Arunachal Pradesh"
    ]
    
    if state and any(ts.lower() in state.lower() for ts in tribal_states):
        return True
    
    return False

async def _apply_rules(context: Dict[str, Any]) -> List[str]:
    """Apply DSS rules to determine applicable schemes"""
    applicable_schemes = []
    
    # Get context flags
    is_tribal = context["location"]["is_tribal_area"]
    is_forest = context["location"]["is_forest_area"]
    has_agri_land = context["claim_info"].get("has_agricultural_land", False)
    is_rural = context["demographic"]["rural"]
    
    # Apply eligibility rules
    rules = dss_engine.rules["eligibility_rules"]
    
    if is_tribal:
        applicable_schemes.extend(rules["tribal_area"]["high_priority"])
        applicable_schemes.extend(rules["tribal_area"]["medium_priority"])
        applicable_schemes.extend(rules["tribal_area"]["applicable"])
    
    if has_agri_land:
        applicable_schemes.extend(rules["agricultural_land"]["high_priority"])
        applicable_schemes.extend(rules["agricultural_land"]["medium_priority"])
        applicable_schemes.extend(rules["agricultural_land"]["applicable"])
    
    if is_forest:
        applicable_schemes.extend(rules["forest_rights_approved"]["high_priority"])
        applicable_schemes.extend(rules["forest_rights_approved"]["medium_priority"])
        applicable_schemes.extend(rules["forest_rights_approved"]["applicable"])
    
    # Remove duplicates while preserving order
    seen = set()
    unique_schemes = []
    for scheme in applicable_schemes:
        if scheme not in seen:
            seen.add(scheme)
            unique_schemes.append(scheme)
    
    return unique_schemes

async def _rank_schemes(schemes: List[str], context: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Rank schemes based on priority and context"""
    ranked_schemes = []
    
    for scheme_id in schemes:
        if scheme_id in dss_engine.css_schemes:
            scheme_info = dss_engine.css_schemes[scheme_id].copy()
            
            # Calculate priority score
            base_priority = scheme_info.get("priority", 5)
            context_boost = await _calculate_context_boost(scheme_id, context)
            final_priority = base_priority + context_boost
            
            scheme_info["calculated_priority"] = final_priority
            scheme_info["scheme_id"] = scheme_id
            scheme_info["eligibility_match"] = await _check_eligibility_match(scheme_id, context)
            
            ranked_schemes.append(scheme_info)
    
    # Sort by priority (higher is better)
    ranked_schemes.sort(key=lambda x: x["calculated_priority"], reverse=True)
    
    return ranked_schemes

async def _calculate_context_boost(scheme_id: str, context: Dict[str, Any]) -> float:
    """Calculate priority boost based on context"""
    boost = 0.0
    
    # Boost for tribal areas
    if context["location"]["is_tribal_area"]:
        if scheme_id in ["DAJGUA", "MGNREGA"]:
            boost += 2.0
        elif scheme_id in ["JAL_JEEVAN_MISSION"]:
            boost += 1.5
    
    # Boost for agricultural land
    if context["claim_info"].get("has_agricultural_land"):
        if scheme_id in ["PM_KISAN", "PMFBY"]:
            boost += 2.0
    
    # Boost for small farmers
    if context["economic"].get("small_farmer"):
        if scheme_id in ["PM_KISAN", "MGNREGA"]:
            boost += 1.0
    
    return boost

async def _check_eligibility_match(scheme_id: str, context: Dict[str, Any]) -> Dict[str, Any]:
    """Check how well the context matches scheme eligibility"""
    scheme = dss_engine.css_schemes[scheme_id]
    eligibility = scheme.get("eligibility", {})
    
    match_score = 0.0
    total_criteria = len(eligibility)
    matched_criteria = []
    missing_requirements = []
    
    # Check each eligibility criterion
    for criterion, requirement in eligibility.items():
        if criterion == "land_holding" and requirement == "up_to_2_hectares":
            area = context["claim_info"].get("area_hectares", 0)
            if area > 0 and area <= 2:
                match_score += 1
                matched_criteria.append("Land holding within limit")
            else:
                missing_requirements.append("Land holding documentation")
        
        elif criterion == "location" and requirement == "rural":
            if context["demographic"]["rural"]:
                match_score += 1
                matched_criteria.append("Rural location")
        
        elif criterion == "beneficiary_type" and requirement == "farmer":
            if context["claim_info"].get("has_agricultural_land"):
                match_score += 1
                matched_criteria.append("Farmer status")
        
        elif criterion == "documentation":
            # Assume partial documentation available
            match_score += 0.5
            matched_criteria.append("Partial documentation available")
            missing_requirements.extend(requirement)
    
    if total_criteria > 0:
        match_percentage = (match_score / total_criteria) * 100
    else:
        match_percentage = 0
    
    return {
        "match_percentage": round(match_percentage, 1),
        "matched_criteria": matched_criteria,
        "missing_requirements": missing_requirements
    }

async def _generate_summary(schemes: List[Dict], context: Dict[str, Any]) -> Dict[str, Any]:
    """Generate recommendation summary"""
    
    high_priority = [s for s in schemes if s["calculated_priority"] >= 8]
    medium_priority = [s for s in schemes if 6 <= s["calculated_priority"] < 8]
    low_priority = [s for s in schemes if s["calculated_priority"] < 6]
    
    summary = {
        "total_schemes": len(schemes),
        "high_priority_count": len(high_priority),
        "medium_priority_count": len(medium_priority),
        "low_priority_count": len(low_priority),
        "top_3_recommendations": [s["name"] for s in schemes[:3]],
        "immediate_actions": [],
        "documentation_needed": set()
    }
    
    # Generate immediate actions
    if high_priority:
        summary["immediate_actions"].append(f"Apply for {high_priority[0]['name']} immediately")
    
    if context["claim_info"].get("has_agricultural_land"):
        summary["immediate_actions"].append("Prepare land records for agricultural schemes")
    
    # Collect documentation requirements
    for scheme in schemes[:5]:  # Top 5 schemes
        missing_docs = scheme.get("eligibility_match", {}).get("missing_requirements", [])
        summary["documentation_needed"].update(missing_docs)
    
    summary["documentation_needed"] = list(summary["documentation_needed"])
    
    return summary