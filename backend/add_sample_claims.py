import asyncio
import asyncpg
from datetime import datetime, timedelta
import sys

async def add_sample_claims():
    """Add sample claims that link to the existing parcels"""
    
    # Database connection
    conn = await asyncpg.connect(
        "postgresql://postgres:suraj@localhost:5432/fra_atlas"
    )
    
    try:
        # Sample claims data to match existing parcels
        sample_claims = [
            {
                'id': 1,
                'claim_number': 'FRA-RJ-BAN-DEV-001',
                'claimant_name': 'Ramesh Kumar',
                'claim_type': 'Individual',
                'status': 'approved',  # This will make the parcel green
                'state': 'Rajasthan',
                'district': 'Banswara',
                'village': 'Devgadh',
                'area_hectares': 2.5,
                'land_type': 'Agricultural',
                'survey_number': 'SUR-001',
                'officer_name': 'District Collector Banswara',
                'verification_notes': 'Verified documents and field inspection completed. All requirements met.',
                'approval_date': datetime.now() - timedelta(days=5)
            },
            {
                'id': 2,
                'claim_number': 'FRA-RJ-BAN-DEV-002',
                'claimant_name': 'Sunita Meena',
                'claim_type': 'Individual',
                'status': 'pending',  # This will make the parcel orange
                'state': 'Rajasthan',
                'district': 'Banswara',
                'village': 'Devgadh',
                'area_hectares': 1.8,
                'land_type': 'Forest',
                'survey_number': 'SUR-002',
                'verification_notes': 'Document review in progress. Field inspection pending.',
            },
            {
                'id': 3,
                'claim_number': 'FRA-RJ-UDA-GHA-001',
                'claimant_name': 'Mohan Lal Bhil',
                'claim_type': 'Community',
                'status': 'approved',  # This will make the parcel green
                'state': 'Rajasthan',
                'district': 'Udaipur',
                'village': 'Gharol',
                'area_hectares': 3.2,
                'land_type': 'Agricultural',
                'survey_number': 'SUR-003',
                'officer_name': 'District Collector Udaipur',
                'verification_notes': 'Community claim verified with village committee approval.',
                'approval_date': datetime.now() - timedelta(days=10)
            },
            {
                'id': 4,
                'claim_number': 'FRA-RJ-BAN-KUS-001',
                'claimant_name': 'Geeta Damor',
                'claim_type': 'Individual',
                'status': 'rejected',  # This will make the parcel red
                'state': 'Rajasthan',
                'district': 'Banswara',
                'village': 'Kushalgarh',
                'area_hectares': 1.5,
                'land_type': 'Residential',
                'survey_number': 'SUR-004',
                'officer_name': 'Assistant Collector Banswara',
                'verification_notes': 'Insufficient documentation. Land classification disputed.',
                'approval_date': datetime.now() - timedelta(days=3)
            },
            {
                'id': 5,
                'claim_number': 'FRA-MP-BOH-BAG-001',
                'claimant_name': 'Vikram Barela',
                'claim_type': 'Community',
                'status': 'pending',  # This will make the parcel orange
                'state': 'Madhya Pradesh',
                'district': 'Bhopal',
                'village': 'Bagidora',
                'area_hectares': 4.1,
                'land_type': 'Mixed',
                'survey_number': 'SUR-005',
                'verification_notes': 'Large community claim under review. Additional documentation requested.',
            }
        ]
        
        # Update existing claims instead of deleting them
        print("Updating existing claims with proper data...")
        
        # Update the claims that are already linked to parcels
        claim_updates = [
            (1, 'FRA-RJ-BAN-DEV-001', 'Ramesh Kumar', 'Individual', 'approved', 'Rajasthan', 'Banswara', 'Devgadh'),
            (2, 'FRA-RJ-BAN-DEV-002', 'Sunita Meena', 'Individual', 'pending', 'Rajasthan', 'Banswara', 'Devgadh'),
            (3, 'FRA-RJ-UDA-GHA-001', 'Mohan Lal Bhil', 'Community', 'approved', 'Rajasthan', 'Udaipur', 'Gharol'),
            (4, 'FRA-RJ-BAN-KUS-001', 'Geeta Damor', 'Individual', 'rejected', 'Rajasthan', 'Banswara', 'Kushalgarh'),
            (5, 'FRA-MP-BOH-BAG-001', 'Vikram Barela', 'Community', 'pending', 'Madhya Pradesh', 'Bhopal', 'Bagidora')
        ]
        
        for claim_id, claim_number, claimant_name, claim_type, status, state, district, village in claim_updates:
            await conn.execute("""
                UPDATE claims SET
                    claim_number = $2,
                    claimant_name = $3,
                    claim_type = $4,
                    status = $5,
                    state = $6,
                    district = $7,
                    village = $8,
                    area_hectares = 2.5,
                    land_type = 'Mixed',
                    survey_number = $2,
                    officer_name = CASE 
                        WHEN $5 = 'approved' THEN 'District Collector ' || $7
                        WHEN $5 = 'rejected' THEN 'Assistant Collector ' || $7
                        ELSE NULL
                    END,
                    verification_notes = CASE 
                        WHEN $5 = 'approved' THEN 'Verified and approved'
                        WHEN $5 = 'rejected' THEN 'Insufficient documentation'
                        ELSE 'Under review'
                    END,
                    approval_date = CASE 
                        WHEN $5 = 'approved' THEN NOW() - INTERVAL '5 days'
                        WHEN $5 = 'rejected' THEN NOW() - INTERVAL '3 days'
                        ELSE NULL
                    END,
                    updated_date = NOW()
                WHERE id = $1
            """, claim_id, claim_number, claimant_name, claim_type, status, state, district, village)
        
        print(f"Successfully updated 5 claims in database")
        print("\nClaim Status Summary:")
        print("- Approved: 2 claims (will show as green parcels)")
        print("- Pending: 2 claims (will show as orange parcels)")
        print("- Rejected: 1 claim (will show as red parcel)")
        
        print("\nClaims are already linked to parcels!")
        
    except Exception as e:
        print(f"Error updating sample claims: {e}")
        sys.exit(1)
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(add_sample_claims())