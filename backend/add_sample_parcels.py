import asyncio
import asyncpg
import json

async def add_sample_parcels():
    """Add sample parcel data with geometry for testing GIS viewer"""
    
    # Database connection
    conn = await asyncpg.connect(
        "postgresql://postgres:suraj@localhost:5432/fra_atlas"
    )
    
    try:
        # Sample GeoJSON geometries for different locations
        sample_parcels = [
            {
                'parcel_id': 'RJ-BAN-DEV-001',
                'claim_id': 1,
                'state': 'Rajasthan',
                'district': 'Banswara',
                'village': 'Devgadh',
                'survey_number': 'SUR-001',
                'area_hectares': 2.5,
                'land_type': 'Agricultural',
                'land_classification': 'Forest Land',
                'geometry_text': json.dumps({
                    "type": "Polygon",
                    "coordinates": [[
                        [74.4500, 23.5500],
                        [74.4550, 23.5500],
                        [74.4550, 23.5550],
                        [74.4500, 23.5550],
                        [74.4500, 23.5500]
                    ]]
                }),
                'boundaries': 'North: Village road, South: River, East: Agricultural land, West: Forest',
                'remarks': 'Prime agricultural land with water access'
            },
            {
                'parcel_id': 'RJ-BAN-DEV-002',
                'claim_id': 2,
                'state': 'Rajasthan',
                'district': 'Banswara',
                'village': 'Devgadh',
                'survey_number': 'SUR-002',
                'area_hectares': 1.8,
                'land_type': 'Forest',
                'land_classification': 'Forest Land',
                'geometry_text': json.dumps({
                    "type": "Polygon",
                    "coordinates": [[
                        [74.4600, 23.5600],
                        [74.4650, 23.5600],
                        [74.4650, 23.5650],
                        [74.4600, 23.5650],
                        [74.4600, 23.5600]
                    ]]
                }),
                'boundaries': 'Surrounded by dense forest area',
                'remarks': 'Traditional forest dweller habitat'
            },
            {
                'parcel_id': 'RJ-UDA-GHA-001',
                'claim_id': 3,
                'state': 'Rajasthan',
                'district': 'Udaipur',
                'village': 'Gharol',
                'survey_number': 'SUR-003',
                'area_hectares': 3.2,
                'land_type': 'Agricultural',
                'land_classification': 'Revenue Land',
                'geometry_text': json.dumps({
                    "type": "Polygon",
                    "coordinates": [[
                        [73.7000, 24.5000],
                        [73.7080, 24.5000],
                        [73.7080, 24.5080],
                        [73.7000, 24.5080],
                        [73.7000, 24.5000]
                    ]]
                }),
                'boundaries': 'Near lake with irrigation facilities',
                'remarks': 'High productivity agricultural land'
            },
            {
                'parcel_id': 'RJ-BAN-KUS-001',
                'claim_id': 4,
                'state': 'Rajasthan',
                'district': 'Banswara',
                'village': 'Kushalgarh',
                'survey_number': 'SUR-004',
                'area_hectares': 1.5,
                'land_type': 'Residential',
                'land_classification': 'Forest Land',
                'geometry_text': json.dumps({
                    "type": "Polygon",
                    "coordinates": [[
                        [74.2500, 23.2500],
                        [74.2530, 23.2500],
                        [74.2530, 23.2530],
                        [74.2500, 23.2530],
                        [74.2500, 23.2500]
                    ]]
                }),
                'boundaries': 'Village settlement area',
                'remarks': 'Residential area for forest dwellers'
            },
            {
                'parcel_id': 'MP-BOH-BAG-001',
                'claim_id': 5,
                'state': 'Madhya Pradesh',
                'district': 'Bhopal',
                'village': 'Bagidora',
                'survey_number': 'SUR-005',
                'area_hectares': 4.1,
                'land_type': 'Mixed',
                'land_classification': 'Forest Land',
                'geometry_text': json.dumps({
                    "type": "Polygon",
                    "coordinates": [[
                        [77.4000, 23.2000],
                        [77.4100, 23.2000],
                        [77.4100, 23.2100],
                        [77.4000, 23.2100],
                        [77.4000, 23.2000]
                    ]]
                }),
                'boundaries': 'Mixed use land with forest and agricultural areas',
                'remarks': 'Multi-purpose land use for community'
            }
        ]
        
        # Insert sample parcels
        for parcel in sample_parcels:
            await conn.execute("""
                INSERT INTO parcels (
                    parcel_id, claim_id, state, district, village, 
                    survey_number, area_hectares, land_type, land_classification,
                    geometry_text, boundaries, remarks
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                ON CONFLICT (parcel_id) DO UPDATE SET
                    geometry_text = EXCLUDED.geometry_text,
                    boundaries = EXCLUDED.boundaries,
                    remarks = EXCLUDED.remarks
            """, 
                parcel['parcel_id'],
                parcel['claim_id'],
                parcel['state'],
                parcel['district'],
                parcel['village'],
                parcel['survey_number'],
                parcel['area_hectares'],
                parcel['land_type'],
                parcel['land_classification'],
                parcel['geometry_text'],
                parcel['boundaries'],
                parcel['remarks']
            )
        
        print(f"Successfully added {len(sample_parcels)} sample parcels to database")
        
    except Exception as e:
        print(f"Error adding sample parcels: {e}")
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(add_sample_parcels())