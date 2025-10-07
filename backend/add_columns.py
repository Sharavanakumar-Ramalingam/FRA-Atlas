#!/usr/bin/env python3
"""
Script to add missing columns to the claims table
"""
import asyncio
import asyncpg
import sys

async def add_columns():
    """Add missing columns to claims table"""
    try:
        conn = await asyncpg.connect(
            host='localhost',
            port=5432,
            user='postgres',
            password='suraj',
            database='fra_atlas'
        )
        
        print("Connected to database successfully")
        
        # Add new columns to claims table
        columns_to_add = [
            "ALTER TABLE claims ADD COLUMN IF NOT EXISTS verification_notes TEXT;",
            "ALTER TABLE claims ADD COLUMN IF NOT EXISTS officer_name VARCHAR(255);",
            "ALTER TABLE claims ADD COLUMN IF NOT EXISTS approval_date TIMESTAMP;",
            "ALTER TABLE claims ADD COLUMN IF NOT EXISTS dss_recommendation TEXT;",
            "ALTER TABLE claims ADD COLUMN IF NOT EXISTS recommended_schemes JSON;"
        ]
        
        for sql in columns_to_add:
            await conn.execute(sql)
            print(f"Executed: {sql}")
        
        print("✅ Successfully added all new columns to claims table")
        
        # Verify columns exist
        result = await conn.fetch("""
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'claims' 
            ORDER BY column_name;
        """)
        
        print("\n📋 Current columns in claims table:")
        for row in result:
            print(f"  - {row['column_name']}: {row['data_type']}")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)
    finally:
        await conn.close()
        print("\nDatabase connection closed")

if __name__ == "__main__":
    asyncio.run(add_columns())