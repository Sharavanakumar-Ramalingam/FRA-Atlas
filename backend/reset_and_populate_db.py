import asyncio
import asyncpg
from datetime import datetime, timedelta
import sys

async def reset_and_populate_database():
    """Reset database and populate with Telangana and Odisha FRA data"""
    
    # Database connection
    conn = await asyncpg.connect(
        "postgresql://postgres:suraj@localhost:5432/fra_atlas"
    )
    
    try:
        print("🗑️  Clearing existing data...")
        
        # Clear all existing data
        await conn.execute("DELETE FROM parcels")
        await conn.execute("DELETE FROM claims")
        await conn.execute("DELETE FROM documents")
        
        # Reset sequences
        await conn.execute("ALTER SEQUENCE parcels_id_seq RESTART WITH 1")
        await conn.execute("ALTER SEQUENCE claims_id_seq RESTART WITH 1")
        await conn.execute("ALTER SEQUENCE documents_id_seq RESTART WITH 1")
        
        print("✅ Database cleared successfully!")
        
        print("\n📊 Creating sample claims for Telangana and Odisha...")
        
        # Sample claims data for Telangana and Odisha
        telangana_odisha_claims = [
            # TELANGANA CLAIMS
            {
                'claim_number': 'FRA-TS-WAR-ETU-001',
                'claimant_name': 'Ramesh Goud',
                'claim_type': 'Individual',
                'status': 'approved',
                'state': 'Telangana',
                'district': 'Warangal',
                'block': 'Eturnagaram',
                'village': 'Eturunagaram',
                'area_hectares': 2.3,
                'land_type': 'Agricultural',
                'survey_number': 'SUR-TS-001',
                'officer_name': 'District Collector Warangal',
                'verification_notes': 'Individual forest rights verified. Traditional cultivation evidence provided.',
                'approval_date': datetime.now() - timedelta(days=15)
            },
            {
                'claim_number': 'FRA-TS-KHA-BHA-001',
                'claimant_name': 'Lakshmi Community',
                'claim_type': 'Community',
                'status': 'pending',
                'state': 'Telangana',
                'district': 'Khammam',
                'block': 'Bhadrachalam',
                'village': 'Bhadrachalam',
                'area_hectares': 5.7,
                'land_type': 'Forest',
                'survey_number': 'SUR-TS-002',
                'verification_notes': 'Community forest rights claim under review. Village committee meeting scheduled.',
            },
            {
                'claim_number': 'FRA-TS-ADI-UTA-001',
                'claimant_name': 'Anjamma Tribal Collective',
                'claim_type': 'Community',
                'status': 'approved',
                'state': 'Telangana',
                'district': 'Adilabad',
                'block': 'Utnoor',
                'village': 'Utnoor',
                'area_hectares': 8.2,
                'land_type': 'Mixed',
                'survey_number': 'SUR-TS-003',
                'officer_name': 'District Collector Adilabad',
                'verification_notes': 'Tribal community rights approved. Historical evidence of traditional use verified.',
                'approval_date': datetime.now() - timedelta(days=25)
            },
            {
                'claim_number': 'FRA-TS-MED-MED-001',
                'claimant_name': 'Ravi Kumar',
                'claim_type': 'Individual',
                'status': 'rejected',
                'state': 'Telangana',
                'district': 'Medak',
                'block': 'Medak',
                'village': 'Medak',
                'area_hectares': 1.8,
                'land_type': 'Residential',
                'survey_number': 'SUR-TS-004',
                'officer_name': 'Assistant Collector Medak',
                'verification_notes': 'Insufficient evidence of traditional occupation. Land classification disputed.',
                'approval_date': datetime.now() - timedelta(days=8)
            },
            
            # ODISHA CLAIMS
            {
                'claim_number': 'FRA-OD-KAL-BHU-001',
                'claimant_name': 'Santosh Pradhan',
                'claim_type': 'Individual',
                'status': 'approved',
                'state': 'Odisha',
                'district': 'Kalahandi',
                'block': 'Bhawanipatna',
                'village': 'Bhawanipatna',
                'area_hectares': 3.1,
                'land_type': 'Agricultural',
                'survey_number': 'SUR-OD-001',
                'officer_name': 'District Collector Kalahandi',
                'verification_notes': 'Forest dwelling rights established. Cultivation records verified.',
                'approval_date': datetime.now() - timedelta(days=12)
            },
            {
                'claim_number': 'FRA-OD-RAY-RAY-001',
                'claimant_name': 'Mayurbhanj Tribal Group',
                'claim_type': 'Community',
                'status': 'pending',
                'state': 'Odisha',
                'district': 'Rayagada',
                'block': 'Rayagada',
                'village': 'Rayagada',
                'area_hectares': 6.4,
                'land_type': 'Forest',
                'survey_number': 'SUR-OD-002',
                'verification_notes': 'Large community claim. Environmental impact assessment in progress.',
            },
            {
                'claim_number': 'FRA-OD-SUN-SUN-001',
                'claimant_name': 'Bijay Sahoo',
                'claim_type': 'Individual',
                'status': 'pending',
                'state': 'Odisha',
                'district': 'Sundargarh',
                'block': 'Sundargarh',
                'village': 'Sundargarh',
                'area_hectares': 2.7,
                'land_type': 'Mixed',
                'survey_number': 'SUR-OD-003',
                'verification_notes': 'Documentation review in progress. Field inspection scheduled.',
            },
            {
                'claim_number': 'FRA-OD-KOR-KOR-001',
                'claimant_name': 'Tribal Welfare Society',
                'claim_type': 'Community',
                'status': 'approved',
                'state': 'Odisha',
                'district': 'Koraput',
                'block': 'Koraput',
                'village': 'Koraput',
                'area_hectares': 9.8,
                'land_type': 'Forest',
                'survey_number': 'SUR-OD-004',
                'officer_name': 'District Collector Koraput',
                'verification_notes': 'Community forest rights approved. Traditional management practices recognized.',
                'approval_date': datetime.now() - timedelta(days=20)
            }
        ]
        
        # Insert claims
        claim_ids = []
        for i, claim in enumerate(telangana_odisha_claims, 1):
            result = await conn.fetchrow("""
                INSERT INTO claims (
                    claim_number, claimant_name, claim_type, status,
                    state, district, block, village, area_hectares, land_type,
                    survey_number, officer_name, verification_notes, approval_date,
                    created_date, claim_date, family_members
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
                RETURNING id
            """, 
                claim['claim_number'],
                claim['claimant_name'],
                claim['claim_type'],
                claim['status'],
                claim['state'],
                claim['district'],
                claim['block'],
                claim['village'],
                claim['area_hectares'],
                claim['land_type'],
                claim['survey_number'],
                claim.get('officer_name'),
                claim.get('verification_notes'),
                claim.get('approval_date'),
                datetime.now(),
                datetime.now() - timedelta(days=45),  # Claim submitted 45 days ago
                4 if claim['claim_type'] == 'Individual' else 15  # Family members
            )
            claim_ids.append(result['id'])
        
        print(f"✅ Created {len(telangana_odisha_claims)} claims")
        
        print("\n🗺️  Creating corresponding parcels...")
        
        # Sample parcels data to match claims
        parcels_data = [
            # TELANGANA PARCELS
            {
                'parcel_id': 'PAR-TS-WAR-ETU-001',
                'state': 'Telangana',
                'district': 'Warangal',
                'block': 'Eturnagaram',
                'village': 'Eturunagaram',
                'survey_number': 'SUR-TS-001',
                'area_hectares': 2.3,
                'land_type': 'Agricultural',
                'land_classification': 'Revenue',
                'geometry_text': '{"type":"Polygon","coordinates":[[[79.0589,18.0076],[79.0595,18.0076],[79.0595,18.0082],[79.0589,18.0082],[79.0589,18.0076]]]}',
                'boundaries': 'North: Road, South: Stream, East: Village boundary, West: Agricultural land',
                'claim_id': claim_ids[0]
            },
            {
                'parcel_id': 'PAR-TS-KHA-BHA-001',
                'state': 'Telangana',
                'district': 'Khammam',
                'block': 'Bhadrachalam',
                'village': 'Bhadrachalam',
                'survey_number': 'SUR-TS-002',
                'area_hectares': 5.7,
                'land_type': 'Forest',
                'land_classification': 'Reserve Forest',
                'geometry_text': '{"type":"Polygon","coordinates":[[[80.8936,17.6689],[80.8950,17.6689],[80.8950,17.6705],[80.8936,17.6705],[80.8936,17.6689]]]}',
                'boundaries': 'North: Forest road, South: River Godavari, East: Temple land, West: Reserve forest',
                'claim_id': claim_ids[1]
            },
            {
                'parcel_id': 'PAR-TS-ADI-UTA-001',
                'state': 'Telangana',
                'district': 'Adilabad',
                'block': 'Utnoor',
                'village': 'Utnoor',
                'survey_number': 'SUR-TS-003',
                'area_hectares': 8.2,
                'land_type': 'Mixed',
                'land_classification': 'Protected Forest',
                'geometry_text': '{"type":"Polygon","coordinates":[[[78.8387,19.4608],[78.8405,19.4608],[78.8405,19.4625],[78.8387,19.4625],[78.8387,19.4608]]]}',
                'boundaries': 'North: Tribal settlement, South: Forest department land, East: Water body, West: Cultivation area',
                'claim_id': claim_ids[2]
            },
            {
                'parcel_id': 'PAR-TS-MED-MED-001',
                'state': 'Telangana',
                'district': 'Medak',
                'block': 'Medak',
                'village': 'Medak',
                'survey_number': 'SUR-TS-004',
                'area_hectares': 1.8,
                'land_type': 'Residential',
                'land_classification': 'Revenue',
                'geometry_text': '{"type":"Polygon","coordinates":[[[78.2733,18.0497],[78.2738,18.0497],[78.2738,18.0502],[78.2733,18.0502],[78.2733,18.0497]]]}',
                'boundaries': 'North: Village road, South: Agricultural land, East: Residential plots, West: Common land',
                'claim_id': claim_ids[3]
            },
            
            # ODISHA PARCELS
            {
                'parcel_id': 'PAR-OD-KAL-BHU-001',
                'state': 'Odisha',
                'district': 'Kalahandi',
                'block': 'Bhawanipatna',
                'village': 'Bhawanipatna',
                'survey_number': 'SUR-OD-001',
                'area_hectares': 3.1,
                'land_type': 'Agricultural',
                'land_classification': 'Revenue',
                'geometry_text': '{"type":"Polygon","coordinates":[[[83.1674,19.9102],[83.1682,19.9102],[83.1682,19.9110],[83.1674,19.9110],[83.1674,19.9102]]]}',
                'boundaries': 'North: District road, South: Canal, East: Agricultural fields, West: Village boundary',
                'claim_id': claim_ids[4]
            },
            {
                'parcel_id': 'PAR-OD-RAY-RAY-001',
                'state': 'Odisha',
                'district': 'Rayagada',
                'block': 'Rayagada',
                'village': 'Rayagada',
                'survey_number': 'SUR-OD-002',
                'area_hectares': 6.4,
                'land_type': 'Forest',
                'land_classification': 'Reserve Forest',
                'geometry_text': '{"type":"Polygon","coordinates":[[[83.4176,19.1648],[83.4190,19.1648],[83.4190,19.1665],[83.4176,19.1665],[83.4176,19.1648]]]}',
                'boundaries': 'North: National highway, South: Reserve forest, East: Tribal villages, West: Mining area',
                'claim_id': claim_ids[5]
            },
            {
                'parcel_id': 'PAR-OD-SUN-SUN-001',
                'state': 'Odisha',
                'district': 'Sundargarh',
                'block': 'Sundargarh',
                'village': 'Sundargarh',
                'survey_number': 'SUR-OD-003',
                'area_hectares': 2.7,
                'land_type': 'Mixed',
                'land_classification': 'Revenue',
                'geometry_text': '{"type":"Polygon","coordinates":[[[84.0330,22.1274],[84.0338,22.1274],[84.0338,22.1282],[84.0330,22.1282],[84.0330,22.1274]]]}',
                'boundaries': 'North: Railway line, South: River, East: Industrial area, West: Agricultural land',
                'claim_id': claim_ids[6]
            },
            {
                'parcel_id': 'PAR-OD-KOR-KOR-001',
                'state': 'Odisha',
                'district': 'Koraput',
                'block': 'Koraput',
                'village': 'Koraput',
                'survey_number': 'SUR-OD-004',
                'area_hectares': 9.8,
                'land_type': 'Forest',
                'land_classification': 'Protected Forest',
                'geometry_text': '{"type":"Polygon","coordinates":[[[82.7118,18.8067],[82.7135,18.8067],[82.7135,18.8085],[82.7118,18.8085],[82.7118,18.8067]]]}',
                'boundaries': 'North: State highway, South: Dense forest, East: Tribal rehabilitation, West: Water reservoir',
                'claim_id': claim_ids[7]
            }
        ]
        
        # Insert parcels
        for parcel in parcels_data:
            await conn.execute("""
                INSERT INTO parcels (
                    parcel_id, state, district, block, village, survey_number,
                    area_hectares, land_type, land_classification, geometry_text,
                    boundaries, claim_id, created_date, updated_date
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            """, 
                parcel['parcel_id'],
                parcel['state'],
                parcel['district'], 
                parcel['block'],
                parcel['village'],
                parcel['survey_number'],
                parcel['area_hectares'],
                parcel['land_type'],
                parcel['land_classification'],
                parcel['geometry_text'],
                parcel['boundaries'],
                parcel['claim_id'],
                datetime.now(),
                datetime.now()
            )
        
        print(f"✅ Created {len(parcels_data)} parcels")
        
        print("\n📈 Database Summary:")
        print("=" * 50)
        print("🏛️  TELANGANA:")
        print("   • Warangal (Eturunagaram) - APPROVED ✅")
        print("   • Khammam (Bhadrachalam) - PENDING ⏳")
        print("   • Adilabad (Utnoor) - APPROVED ✅")
        print("   • Medak (Medak) - REJECTED ❌")
        print()
        print("🏛️  ODISHA:")
        print("   • Kalahandi (Bhawanipatna) - APPROVED ✅")
        print("   • Rayagada (Rayagada) - PENDING ⏳")
        print("   • Sundargarh (Sundargarh) - PENDING ⏳")
        print("   • Koraput (Koraput) - APPROVED ✅")
        print()
        print("📊 STATUS BREAKDOWN:")
        print("   • Approved Claims: 4 (Green parcels)")
        print("   • Pending Claims: 3 (Orange parcels)")
        print("   • Rejected Claims: 1 (Red parcels)")
        print("   • Total Parcels: 8")
        print()
        print("🌍 All parcels are properly linked to claims for real-time status updates!")
        
    except Exception as e:
        print(f"❌ Error resetting database: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(reset_and_populate_database())