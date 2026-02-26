import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// SQLite database (persisted)
const dbFile = path.resolve(__dirname, 'data.db');
const db = new Database(dbFile);
// ensure tables
db.exec(`
CREATE TABLE IF NOT EXISTS menu_items (
  id TEXT PRIMARY KEY,
  name TEXT,
  category TEXT,
  cuisine TEXT,
  price REAL,
  is_veg INTEGER,
  popularity_score INTEGER,
  created_date TEXT
);
CREATE TABLE IF NOT EXISTS rec_logs (
  id TEXT PRIMARY KEY,
  session_id TEXT,
  meal_time TEXT,
  user_segment TEXT,
  city TEXT,
  cart_items TEXT,
  recommended_items TEXT,
  accepted_items TEXT,
  aov_before REAL,
  aov_after REAL,
  latency_ms INTEGER,
  created_date TEXT
);
`);

// seed sample data if empty
const countStmt = db.prepare('SELECT COUNT(*) AS cnt FROM menu_items');
const { cnt } = countStmt.get();
if (cnt === 0) {
  const insert = db.prepare(`
    INSERT INTO menu_items (id,name,category,cuisine,price,is_veg,popularity_score,created_date)
    VALUES (@id,@name,@category,@cuisine,@price,@is_veg,@popularity_score,@created_date)
  `);
  const SAMPLE_ITEMS = [
    { name: "Chicken Biryani", category: "main", cuisine: "indian", price: 280, is_veg: 0, popularity_score: 95 },
    { name: "Paneer Butter Masala", category: "main", cuisine: "indian", price: 220, is_veg: 1, popularity_score: 90 },
    { name: "Butter Naan", category: "side", cuisine: "indian", price: 45, is_veg: 1, popularity_score: 88 },
    { name: "Mirchi Ka Salan", category: "condiment", cuisine: "indian", price: 80, is_veg: 1, popularity_score: 72 },
    { name: "Raita", category: "condiment", cuisine: "indian", price: 50, is_veg: 1, popularity_score: 75 },
    { name: "Gulab Jamun", category: "dessert", cuisine: "indian", price: 90, is_veg: 1, popularity_score: 82 },
    { name: "Masala Chai", category: "beverage", cuisine: "indian", price: 40, is_veg: 1, popularity_score: 70 },
    { name: "Mango Lassi", category: "beverage", cuisine: "indian", price: 60, is_veg: 1, popularity_score: 78 },
    { name: "Hakka Noodles", category: "main", cuisine: "chinese", price: 180, is_veg: 1, popularity_score: 85 },
    { name: "Chicken Manchurian", category: "main", cuisine: "chinese", price: 220, is_veg: 0, popularity_score: 83 },
    { name: "Spring Rolls", category: "appetizer", cuisine: "chinese", price: 120, is_veg: 1, popularity_score: 76 },
    { name: "Fried Rice", category: "main", cuisine: "chinese", price: 160, is_veg: 1, popularity_score: 88 },
    { name: "Hot & Sour Soup", category: "appetizer", cuisine: "chinese", price: 100, is_veg: 0, popularity_score: 71 },
    { name: "Cola", category: "beverage", cuisine: "american", price: 45, is_veg: 1, popularity_score: 65 },
    { name: "Margherita Pizza", category: "main", cuisine: "italian", price: 250, is_veg: 1, popularity_score: 92 },
    { name: "Garlic Bread", category: "side", cuisine: "italian", price: 110, is_veg: 1, popularity_score: 80 },
  ];
  const now = new Date().toISOString();
  const insertMany = db.transaction((items) => {
    for (const item of items) {
      insert.run({
        id: `item_${uuidv4()}`,
        ...item,
        created_date: now,
      });
    }
  });
  insertMany(SAMPLE_ITEMS);
}

// Helper: recommendations (reads from DB)
function generateRecommendations(cartItems, context) {
  const cartIds = new Set(cartItems.map(i => i.id));
  const rows = db.prepare('SELECT * FROM menu_items').all();
  const available = rows.filter(r => !cartIds.has(r.id));
  
  const scores = available.map(item => {
    let score = 0;
    const cartCats = new Set(cartItems.map(ci => ci.category));
    if (item.category === 'beverage' && cartCats.has('main')) score += 0.8;
    else if (item.category === 'side' && cartCats.has('main')) score += 0.7;
    else if (item.category === 'dessert') score += 0.6;
    else if (item.category === 'condiment' && (cartCats.has('main') || cartCats.has('side'))) score += 0.7;
    else if (item.category === 'appetizer' && cartItems.length < 2) score += 0.5;
    else score += 0.3;
    
    if (item.cuisine === context.cuisine) score += 0.2;
    else if (['condiment','beverage','side'].includes(item.category)) score += 0.1;

    if (context.user_segment === 'budget' && item.price <= 200) score += 0.2;
    else if (context.user_segment === 'premium' && item.price > 250) score += 0.2;
    else if (context.user_segment === 'frequent') score += 0.1;

    score += (item.popularity_score / 100) * 0.15;

    if (context.meal_time === 'breakfast' && ['side','beverage','condiment'].includes(item.category)) score += 0.1;
    if (context.meal_time === 'lunch' && ['main','side','beverage'].includes(item.category)) score += 0.1;
    if (context.meal_time === 'dinner' && ['main','side','dessert'].includes(item.category)) score += 0.1;
    if (context.meal_time === 'late_night' && item.price <= 300) score += 0.1;

    return { ...item, score: Math.min(score,1) };
  });
  scores.sort((a,b)=>b.score-a.score);
  return scores.slice(0,6);
}

// Endpoints registration helper
function registerRoutes(appInstance) {
  appInstance.get('/', (req, res) => {
    res.json({ message:'Backend running' });
  });

  // Menu items CRUD
  appInstance.get('/menu-items', (req,res)=>{
    const stmt = db.prepare('SELECT * FROM menu_items ORDER BY datetime(created_date) DESC');
    res.json(stmt.all());
  });

  appInstance.post('/menu-items',(req,res)=>{
    const { name, category, cuisine, price, is_veg, popularity_score } = req.body;
    const id = `item_${uuidv4()}`;
    const now = new Date().toISOString();
    const stmt = db.prepare(`
      INSERT INTO menu_items (id,name,category,cuisine,price,is_veg,popularity_score,created_date)
      VALUES (?,?,?,?,?,?,?,?)
    `);
    stmt.run(id,name,category,cuisine,price,is_veg?1:0,popularity_score,now);
    res.json({ id,name,category,cuisine,price,is_veg,popularity_score,created_date: now });
  });

  appInstance.put('/menu-items/:id',(req,res)=>{
    const id = req.params.id;
    const existing = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(id);
    if (!existing) return res.status(404).json({error:'not found'});
    const { name, category, cuisine, price, is_veg, popularity_score } = req.body;
    const stmt = db.prepare(`
      UPDATE menu_items SET name=?,category=?,cuisine=?,price=?,is_veg=?,popularity_score=? WHERE id=?
    `);
    stmt.run(name,category,cuisine,price,is_veg?1:0,popularity_score,id);
    const updated = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(id);
    res.json(updated);
  });

  appInstance.delete('/menu-items/:id',(req,res)=>{
    const id=req.params.id;
    db.prepare('DELETE FROM menu_items WHERE id = ?').run(id);
    res.json({status:'deleted'});
  });

  // Recommendation endpoint
  appInstance.post('/recommend',(req,res)=>{
    const { cart_items, meal_time, cuisine, user_segment, city } = req.body;
    const start = Date.now();
    const recs = generateRecommendations(cart_items || [], { meal_time, cuisine, user_segment, city });
    const latency = Date.now()-start;
    const logId = `log_${uuidv4()}`;
    const now = new Date().toISOString();
    const insertLog = db.prepare(`
      INSERT INTO rec_logs (id,session_id,meal_time,user_segment,city,cart_items,recommended_items,accepted_items,aov_before,aov_after,latency_ms,created_date)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
    `);
    insertLog.run(logId,uuidv4(),meal_time,user_segment,city,
      JSON.stringify(cart_items||[]),
      JSON.stringify(recs),
      JSON.stringify([]),
      0,0,latency,now);
    res.json({ recommendations: recs, latency_ms: latency });
  });

  // Logs endpoints
  appInstance.get('/logs',(req,res)=>{
    const rows = db.prepare('SELECT * FROM rec_logs ORDER BY datetime(created_date) DESC').all();
    res.json(rows.map(r => ({
      ...r,
      cart_items: JSON.parse(r.cart_items || '[]'),
      recommended_items: JSON.parse(r.recommended_items || '[]'),
      accepted_items: JSON.parse(r.accepted_items || '[]'),
    })));
  });

  appInstance.post('/logs',(req,res)=>{
    const { session_id, meal_time, user_segment, city, cart_items, recommended_items, accepted_items, aov_before, aov_after, latency_ms } = req.body;
    const id = `log_${uuidv4()}`;
    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO rec_logs (id,session_id,meal_time,user_segment,city,cart_items,recommended_items,accepted_items,aov_before,aov_after,latency_ms,created_date)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
    `).run(id,session_id,meal_time,user_segment,city,
        JSON.stringify(cart_items||[]),
        JSON.stringify(recommended_items||[]),
        JSON.stringify(accepted_items||[]),
        aov_before||0,aov_after||0,latency_ms||0,now);
    res.json({ id, session_id, meal_time, user_segment, city, cart_items, recommended_items, accepted_items, aov_before, aov_after, latency_ms, created_date: now });
  });
}

// register on root path and under /api
registerRoutes(app);
const apiRouter = express.Router();
registerRoutes(apiRouter);
app.use('/api', apiRouter);


const PORT = process.env.PORT || 8000;
app.listen(PORT,()=>{ console.log(`Backend listening on ${PORT}`); });
