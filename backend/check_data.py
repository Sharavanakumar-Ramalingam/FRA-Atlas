import asyncio
import asyncpg

async def check_data():
    conn = await asyncpg.connect('postgresql://postgres:suraj@localhost:5432/fra_atlas')
    
    print("Existing parcels:")
    parcels = await conn.fetch('SELECT id, parcel_id, claim_id FROM parcels LIMIT 10')
    for p in parcels:
        print(f'  ID: {p[0]}, Parcel: {p[1]}, Claim ID: {p[2]}')
    
    print("\nExisting claims:")
    claims = await conn.fetch('SELECT id, claim_number, status FROM claims LIMIT 10')
    for c in claims:
        print(f'  ID: {c[0]}, Number: {c[1]}, Status: {c[2]}')
    
    await conn.close()

if __name__ == "__main__":
    asyncio.run(check_data())