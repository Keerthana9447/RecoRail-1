import { v4 as uuidv4 } from 'uuid';

// shared in-memory storage for serverless functions
const menuItems = [];
const logs = [];

// seed sample items once
function seedMenu() {
  if (menuItems.length > 0) return;
  const SAMPLE_ITEMS = [
    { name: "Chicken Biryani", category: "main", cuisine: "indian", price: 280, is_veg: false, popularity_score: 95 },
    { name: "Paneer Butter Masala", category: "main", cuisine: "indian", price: 220, is_veg: true, popularity_score: 90 },
    { name: "Butter Naan", category: "side", cuisine: "indian", price: 45, is_veg: true, popularity_score: 88 },
    { name: "Mirchi Ka Salan", category: "condiment", cuisine: "indian", price: 80, is_veg: true, popularity_score: 72 },
    { name: "Raita", category: "condiment", cuisine: "indian", price: 50, is_veg: true, popularity_score: 75 },
    { name: "Gulab Jamun", category: "dessert", cuisine: "indian", price: 90, is_veg: true, popularity_score: 82 },
    { name: "Masala Chai", category: "beverage", cuisine: "indian", price: 40, is_veg: true, popularity_score: 70 },
    { name: "Mango Lassi", category: "beverage", cuisine: "indian", price: 60, is_veg: true, popularity_score: 78 },
    { name: "Hakka Noodles", category: "main", cuisine: "chinese", price: 180, is_veg: true, popularity_score: 85 },
    { name: "Chicken Manchurian", category: "main", cuisine: "chinese", price: 220, is_veg: false, popularity_score: 83 },
    { name: "Spring Rolls", category: "appetizer", cuisine: "chinese", price: 120, is_veg: true, popularity_score: 76 },
    { name: "Fried Rice", category: "main", cuisine: "chinese", price: 160, is_veg: true, popularity_score: 88 },
    { name: "Hot & Sour Soup", category: "appetizer", cuisine: "chinese", price: 100, is_veg: false, popularity_score: 71 },
    { name: "Cola", category: "beverage", cuisine: "american", price: 45, is_veg: true, popularity_score: 65 },
    { name: "Margherita Pizza", category: "main", cuisine: "italian", price: 250, is_veg: true, popularity_score: 92 },
    { name: "Garlic Bread", category: "side", cuisine: "italian", price: 110, is_veg: true, popularity_score: 80 },
  ];
  const now = new Date().toISOString();
  SAMPLE_ITEMS.forEach(item => {
    menuItems.push({ id: `item_${uuidv4()}`, ...item, created_date: now });
  });
}

seedMenu();

export { menuItems, logs, uuidv4 };