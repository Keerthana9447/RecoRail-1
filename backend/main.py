from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional
import json
from sqlalchemy import create_engine, Column, String, Float, Boolean, DateTime, JSON, Integer
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
import os
from contextlib import contextmanager

# Database setup
DATABASE_URL = "sqlite:///./zomato_app.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Models
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

class RecommendationLogDB(Base):
    __tablename__ = "recommendation_logs"
    
    id = Column(String, primary_key=True, index=True)
    session_id = Column(String, index=True)
    meal_time = Column(String)
    user_segment = Column(String)
    city = Column(String)
    cart_items = Column(JSON)
    recommended_items = Column(JSON)
    accepted_items = Column(JSON)
    aov_before = Column(Float)
    aov_after = Column(Float)
    latency_ms = Column(Integer)
    created_date = Column(DateTime, default=datetime.utcnow)

Base.metadata.create_all(bind=engine)

# Initialize database with sample data
def init_sample_data():
    db = SessionLocal()
    try:
        existing_count = db.query(MenuItemDB).count()
        if existing_count > 0:
            return
        
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
        
        for i, item in enumerate(SAMPLE_ITEMS):
            db_item = MenuItemDB(
                id=f"item_{int(datetime.utcnow().timestamp() * 1000) + i}",
                **item
            )
            db.add(db_item)
        
        db.commit()
        print(f"Initialized database with {len(SAMPLE_ITEMS)} menu items")
    finally:
        db.close()

# Pydantic models
class MenuItem(BaseModel):
    id: Optional[str] = None
    name: str
    category: str
    cuisine: str
    price: float
    is_veg: bool
    popularity_score: int = Field(default=50, ge=0, le=100)
    created_date: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class RecommendationLog(BaseModel):
    id: Optional[str] = None
    session_id: str
    meal_time: str
    user_segment: str
    city: str
    cart_items: List[dict]
    recommended_items: List[dict]
    accepted_items: List[dict]
    aov_before: float
    aov_after: float
    latency_ms: int
    created_date: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class RecommendationRequest(BaseModel):
    cart_items: List[dict]
    meal_time: str
    cuisine: str
    user_segment: str
    city: str

# FastAPI app
app = FastAPI(title="Zomato Recommendation Engine")

# Initialize sample data on startup
@app.on_event("startup")
def startup_event():
    init_sample_data()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Menu Items endpoints
@app.get("/menu-items")
def list_menu_items(db: Session = Query(None), skip: int = 0, limit: int = 200):
    db = SessionLocal()
    items = db.query(MenuItemDB).order_by(MenuItemDB.created_date.desc()).offset(skip).limit(limit).all()
    db.close()
    return [MenuItem.from_orm(item) for item in items]

@app.get("/menu-items/{item_id}")
def get_menu_item(item_id: str, db: Session = Query(None)):
    db = SessionLocal()
    item = db.query(MenuItemDB).filter(MenuItemDB.id == item_id).first()
    db.close()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return MenuItem.from_orm(item)

@app.post("/menu-items")
def create_menu_item(item: MenuItem):
    db = SessionLocal()
    item_id = f"item_{int(datetime.utcnow().timestamp() * 1000)}"
    db_item = MenuItemDB(
        id=item_id,
        name=item.name,
        category=item.category,
        cuisine=item.cuisine,
        price=item.price,
        is_veg=item.is_veg,
        popularity_score=item.popularity_score,
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    result = MenuItem.from_orm(db_item)
    db.close()
    return result

@app.put("/menu-items/{item_id}")
def update_menu_item(item_id: str, item: MenuItem):
    db = SessionLocal()
    db_item = db.query(MenuItemDB).filter(MenuItemDB.id == item_id).first()
    if not db_item:
        db.close()
        raise HTTPException(status_code=404, detail="Item not found")
    
    db_item.name = item.name
    db_item.category = item.category
    db_item.cuisine = item.cuisine
    db_item.price = item.price
    db_item.is_veg = item.is_veg
    db_item.popularity_score = item.popularity_score
    
    db.commit()
    db.refresh(db_item)
    result = MenuItem.from_orm(db_item)
    db.close()
    return result

@app.delete("/menu-items/{item_id}")
def delete_menu_item(item_id: str):
    db = SessionLocal()
    db_item = db.query(MenuItemDB).filter(MenuItemDB.id == item_id).first()
    if not db_item:
        db.close()
        raise HTTPException(status_code=404, detail="Item not found")
    
    db.delete(db_item)
    db.commit()
    db.close()
    return {"status": "deleted"}

# Recommendation engine
def get_recommendations(cart_items: List[dict], meal_time: str, cuisine: str, user_segment: str, city: str, db: Session) -> List[dict]:
    """Generate recommendations based on cart and context"""
    
    # Get all menu items
    all_items = db.query(MenuItemDB).all()
    
    # Filter out items already in cart
    cart_ids = {item.get('id') for item in cart_items}
    available_items = [item for item in all_items if item.id not in cart_ids]
    
    if not available_items:
        return []
    
    # Scoring logic based on context
    recommendations = []
    
    for item in available_items:
        score = 0
        
        # Category scoring - complementary items
        cart_categories = {ci.get('category', 'main') for ci in cart_items}
        
        # Suggest different categories
        if item.category == "beverage" and "main" in cart_categories:
            score += 0.8
        elif item.category == "side" and "main" in cart_categories:
            score += 0.7
        elif item.category == "dessert":
            score += 0.6
        elif item.category == "condiment" and ("main" in cart_categories or "side" in cart_categories):
            score += 0.7
        elif item.category == "appetizer" and len(cart_items) < 2:
            score += 0.5
        else:
            score += 0.3
        
        # Cuisine preference
        if item.cuisine == cuisine:
            score += 0.2
        elif item.cuisine in ["condiment", "beverage", "side"]:  # Category that goes with any cuisine
            score += 0.1
        
        # User segment scoring
        if user_segment == "budget" and item.price <= 200:
            score += 0.2
        elif user_segment == "premium" and item.price > 250:
            score += 0.2
        elif user_segment == "frequent":
            score += 0.1  # All items are good
        
        # Popularity boost
        popularity_factor = item.popularity_score / 100.0
        score += (popularity_factor * 0.15)
        
        # Meal time consideration
        if meal_time == "breakfast" and item.category in ["side", "beverage", "condiment"]:
            score += 0.1
        elif meal_time == "lunch" and item.category in ["main", "side", "beverage"]:
            score += 0.1
        elif meal_time == "dinner" and item.category in ["main", "side", "dessert"]:
            score += 0.1
        elif meal_time == "late_night" and item.price <= 300:
            score += 0.1
        
        recommendations.append({
            "id": item.id,
            "name": item.name,
            "category": item.category,
            "cuisine": item.cuisine,
            "price": item.price,
            "is_veg": item.is_veg,
            "score": min(1.0, score),  # Cap at 1.0
        })
    
    # Sort by score and return top 6
    recommendations.sort(key=lambda x: x["score"], reverse=True)
    return recommendations[:6]

@app.post("/recommend")
def get_recommendations_endpoint(request: RecommendationRequest):
    """Get recommendations for a cart"""
    db = SessionLocal()
    try:
        import time
        start_time = time.time()
        
        recs = get_recommendations(
            request.cart_items,
            request.meal_time,
            request.cuisine,
            request.user_segment,
            request.city,
            db
        )
        
        latency = int((time.time() - start_time) * 1000)
        
        return {
            "recommendations": recs,
            "latency_ms": latency
        }
    finally:
        db.close()

# Recommendation Logs endpoints
@app.get("/logs")
def list_logs(skip: int = 0, limit: int = 100):
    db = SessionLocal()
    logs = db.query(RecommendationLogDB).order_by(RecommendationLogDB.created_date.desc()).offset(skip).limit(limit).all()
    db.close()
    return [RecommendationLog.from_orm(log) for log in logs]

@app.post("/logs")
def create_log(log: RecommendationLog):
    db = SessionLocal()
    log_id = f"log_{int(datetime.utcnow().timestamp() * 1000)}"
    db_log = RecommendationLogDB(
        id=log_id,
        session_id=log.session_id,
        meal_time=log.meal_time,
        user_segment=log.user_segment,
        city=log.city,
        cart_items=log.cart_items,
        recommended_items=log.recommended_items,
        accepted_items=log.accepted_items,
        aov_before=log.aov_before,
        aov_after=log.aov_after,
        latency_ms=log.latency_ms,
    )
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    result = RecommendationLog.from_orm(db_log)
    db.close()
    return result

@app.get("/stats")
def get_stats():
    """Get statistics about recommendations"""
    db = SessionLocal()
    
    total_items = db.query(MenuItemDB).count()
    total_logs = db.query(RecommendationLogDB).count()
    
    if total_logs > 0:
        avg_acceptance = db.query(RecommendationLogDB).all()
        total_accepted = sum(len(log.accepted_items or []) for log in avg_acceptance)
        total_recommended = sum(len(log.recommended_items or []) for log in avg_acceptance)
        acceptance_rate = (total_accepted / total_recommended * 100) if total_recommended > 0 else 0
    else:
        acceptance_rate = 0
    
    db.close()
    
    return {
        "total_items": total_items,
        "total_logs": total_logs,
        "acceptance_rate": acceptance_rate,
    }

@app.get("/")
def read_root():
    return {
        "message": "Zomato Recommendation Engine API",
        "version": "1.0.0",
        "endpoints": {
            "menu_items": "/menu-items",
            "recommendations": "/recommend",
            "logs": "/logs",
            "stats": "/stats"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
