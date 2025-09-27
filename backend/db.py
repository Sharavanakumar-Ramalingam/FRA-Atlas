import os
from sqlalchemy import create_engine, MetaData
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from geoalchemy2 import Geometry
from decouple import config
import logging

logger = logging.getLogger(__name__)

# Database configuration
DATABASE_URL = config(
    'DATABASE_URL',
    default='postgresql+asyncpg://postgres:suraj@localhost:5432/fra_atlas'
)

# Create async engine
engine = create_async_engine(
    DATABASE_URL,
    echo=config('DEBUG', default=False, cast=bool),
    future=True
)

# Create session factory
async_session = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)

# Base class for ORM models
Base = declarative_base()

async def get_db():
    """Dependency to get database session"""
    async with async_session() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

async def init_db():
    """Initialize database tables"""
    try:
        # First, try to enable PostGIS in a separate connection
        try:
            async with engine.connect() as conn:
                from sqlalchemy import text
                await conn.execute(text("CREATE EXTENSION IF NOT EXISTS postgis;"))
                await conn.commit()
                logger.info("PostGIS extension enabled")
        except Exception as e:
            logger.warning(f"PostGIS extension not available (spatial features disabled): {e}")
        
        # Then create tables in a new transaction
        async with engine.begin() as conn:
            # Import models to ensure they're registered
            from models.document import Document
            from models.claim import Claim
            from models.parcel import Parcel
            
            # Create tables
            await conn.run_sync(Base.metadata.create_all)
            
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Error initializing database: {e}")
        raise

async def close_db():
    """Close database connections"""
    await engine.dispose()