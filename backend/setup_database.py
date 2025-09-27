"""
Database Setup Script for FRA Atlas 360
Run this after PostgreSQL installation is complete
"""

import asyncio
import logging
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def create_database():
    """Create the FRA Atlas database and enable PostGIS"""
    
    # Connect to PostgreSQL as superuser to create database
    admin_engine = create_async_engine(
        "postgresql+asyncpg://postgres:suraj@localhost:5432/postgres"
    )
    
    try:
        async with admin_engine.begin() as conn:
            # Check if database exists
            result = await conn.execute(
                text("SELECT 1 FROM pg_database WHERE datname = 'fra_atlas'")
            )
            
            if not result.fetchone():
                # Create database
                await conn.execute(text("CREATE DATABASE fra_atlas"))
                logger.info("Database 'fra_atlas' created successfully")
            else:
                logger.info("Database 'fra_atlas' already exists")
                
    except Exception as e:
        logger.error(f"Error creating database: {e}")
        raise
    finally:
        await admin_engine.dispose()
    
    # Connect to the new database to enable PostGIS
    fra_engine = create_async_engine(
        "postgresql+asyncpg://postgres:suraj@localhost:5432/fra_atlas"
    )
    
    try:
        async with fra_engine.begin() as conn:
            # Enable PostGIS extension
            await conn.execute(text("CREATE EXTENSION IF NOT EXISTS postgis"))
            logger.info("PostGIS extension enabled")
            
    except Exception as e:
        logger.error(f"Error enabling PostGIS: {e}")
        raise
    finally:
        await fra_engine.dispose()

if __name__ == "__main__":
    print("🗄️  FRA Atlas Database Setup")
    print("=" * 40)
    print("This will create the 'fra_atlas' database and enable PostGIS")
    print()
    
    try:
        asyncio.run(create_database())
        print("✅ Database setup completed successfully!")
        print()
        print("Next steps:")
        print("1. Run: python main.py (to start the backend server)")
        print("2. The server will create all necessary tables automatically")
        
    except Exception as e:
        print(f"❌ Database setup failed: {e}")
        print()
        print("Make sure PostgreSQL is running and accessible with:")
        print("  Username: postgres")
        print("  Password: suraj")
        print("  Host: localhost")
        print("  Port: 5432")