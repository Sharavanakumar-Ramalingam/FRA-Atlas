import asyncio
import asyncpg

async def test_connection():
    try:
        conn = await asyncpg.connect('postgresql://postgres:suraj@localhost:5432/fra_atlas')
        print("Database connected successfully!")
        await conn.close()
        return True
    except Exception as e:
        print(f"Database connection failed: {e}")
        return False

if __name__ == "__main__":
    asyncio.run(test_connection())