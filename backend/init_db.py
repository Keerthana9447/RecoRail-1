"""Initialize the database with sample menu items"""
from sqlalchemy import create_engine, Column, String, Float, Boolean, DateTime, JSON, Integer
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

DATABASE_URL = "sqlite:///./zomato_app.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
Base = declarative_base()

class MenuItemDB(Base):
    __tablename__ = "menu_items"
    
    id = Column(String, primary_key=True, index=True)
    name = Column(String, index=True)
    category = Column(String)
    cuisine = Column(String)
    price = Column(Float)
    is_veg = Column(Boolean)
    popularity_score = Column(Integer, default=50)
    created_date = Column(DateTime, default=datetime.utcnow)

Base.metadata.create_all(bind=engine)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

SAMPLE_ITEMS = [
    {"name": "Chicken Biryani", "category": "main", "cuisine": "indian", "price": 280, "is_veg": False, "popularity_score": 95},
    {"name": "Paneer Butter Masala", "category": "main", "cuisine": "indian", "price": 220, "is_veg": True, "popularity_score": 90},
    {"name": "Butter Naan", "category": "side", "cuisine": "indian", "price": 45, "is_veg": True, "popularity_score": 88},
    {"name": "Mirchi Ka Salan", "category": "condiment", "cuisine": "indian", "price": 80, "is_veg": True, "popularity_score": 72},
    {"name": "Raita", "category": "condiment", "cuisine": "indian", "price": 50, "is_veg": True, "popularity_score": 75},
    {"name": "Gulab Jamun", "category": "dessert", "cuisine": "indian", "price": 90, "is_veg": True, "popularity_score": 82},
    {"name": "Masala Chai", "category": "beverage", "cuisine": "indian", "price": 40, "is_veg": True, "popularity_score": 70},
    {"name": "Mango Lassi", "category": "beverage", "cuisine": "indian", "price": 60, "is_veg": True, "popularity_score": 78},
    {"name": "Hakka Noodles", "category": "main", "cuisine": "chinese", "price": 180, "is_veg": True, "popularity_score": 85},
    {"name": "Chicken Manchurian", "category": "main", "cuisine": "chinese", "price": 220, "is_veg": False, "popularity_score": 83},
    {"name": "Spring Rolls", "category": "appetizer", "cuisine": "chinese", "price": 120, "is_veg": True, "popularity_score": 76},
    {"name": "Fried Rice", "category": "main", "cuisine": "chinese", "price": 160, "is_veg": True, "popularity_score": 88},
    {"name": "Hot & Sour Soup", "category": "appetizer", "cuisine": "chinese", "price": 100, "is_veg": False, "popularity_score": 71},
    {"name": "Cola", "category": "beverage", "cuisine": "american", "price": 45, "is_veg": True, "popularity_score": 65},
    {"name": "Margherita Pizza", "category": "main", "cuisine": "italian", "price": 250, "is_veg": True, "popularity_score": 92},
    {"name": "Garlic Bread", "category": "side", "cuisine": "italian", "price": 110, "is_veg": True, "popularity_score": 80},
    {"name": "Samosa", "category": "appetizer", "cuisine": "indian", "price": 40, "is_veg": True, "popularity_score": 85},
    {"name": "Dosa", "category": "main", "cuisine": "indian", "price": 150, "is_veg": True, "popularity_score": 88},
    {"name": "Idli", "category": "side", "cuisine": "indian", "price": 60, "is_veg": True, "popularity_score": 70},
    {"name": "Tandoori Chicken", "category": "main", "cuisine": "indian", "price": 320, "is_veg": False, "popularity_score": 92},
]

def init_db():
    db = SessionLocal()
    
    # Check if items already exist
    existing_count = db.query(MenuItemDB).count()
    if existing_count > 0:
        print(f"Database already has {existing_count} items. Skipping initialization.")
        db.close()
        return
    
    # Add sample items
    for i, item in enumerate(SAMPLE_ITEMS):
        db_item = MenuItemDB(
            id=f"item_{int(datetime.utcnow().timestamp() * 1000) + i}",
            **item
        )
        db.add(db_item)
    
    db.commit()
    print(f"Initialized database with {len(SAMPLE_ITEMS)} menu items")
    db.close()

if __name__ == "__main__":
    init_db()
