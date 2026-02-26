import { menuItems, uuidv4 } from './store.js';

export default function handler(req, res) {
  const { method } = req;
  if (method === 'GET') {
    // sort newest first
    const sorted = [...menuItems].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    return res.status(200).json(sorted);
  }
  if (method === 'POST') {
    const { name, category, cuisine, price, is_veg, popularity_score } = req.body;
    const id = `item_${uuidv4()}`;
    const now = new Date().toISOString();
    const item = { id, name, category, cuisine, price, is_veg, popularity_score, created_date: now };
    menuItems.push(item);
    return res.status(201).json(item);
  }
  if (method === 'PUT') {
    const id = req.query.id;
    const idx = menuItems.findIndex(i => i.id === id);
    if (idx === -1) return res.status(404).json({ error: 'not found' });
    Object.assign(menuItems[idx], req.body);
    return res.status(200).json(menuItems[idx]);
  }
  if (method === 'DELETE') {
    const id = req.query.id;
    const idx = menuItems.findIndex(i => i.id === id);
    if (idx !== -1) menuItems.splice(idx, 1);
    return res.status(200).json({ status: 'deleted' });
  }
  res.setHeader('Allow', ['GET','POST','PUT','DELETE']);
  res.status(405).end(`Method ${method} Not Allowed`);
}