import os
from sqlalchemy import create_engine, MetaData
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from decouple import config
import logging

logger = logging.getLogger(__name__)

# Database configuration - Using SQLite instead of PostgreSQL
DATABASE_DIR = "data"
DATABASE_FILE = "fra_atlas.db"
DATABASE_PATH = os.path.join(DATABASE_DIR, DATABASE_FILE)

# Ensure data directory exists
os.makedirs(DATABASE_DIR, exist_ok=True)

# SQLite async URL
DATABASE_URL = f"sqlite+aiosqlite:///{DATABASE_PATH}"

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
        async with engine.begin() as conn:
            # Import models to ensure they're registered
            from models.document import Document
            from models.claim import Claim
            from models.parcel import Parcel
            
            # Create tables
            await conn.run_sync(Base.metadata.create_all)
            
        logger.info("Database tables created successfully with SQLite")
    except Exception as e:
        logger.error(f"Error initializing database: {e}")
        raise

async def close_db():
    """Close database connections"""
    await engine.dispose()