import { logs, uuidv4 } from './store.js';

export default function handler(req, res) {
  const { method } = req;
  if (method === 'GET') {
    const sorted = [...logs].sort((a,b)=>new Date(b.created_date)-new Date(a.created_date));
    return res.status(200).json(sorted);
  }
  if (method === 'POST') {
    const { session_id, meal_time, user_segment, city, cart_items, recommended_items, accepted_items, aov_before, aov_after, latency_ms } = req.body;
    const id = `log_${uuidv4()}`;
    const now = new Date().toISOString();
    const entry = { id, session_id, meal_time, user_segment, city, cart_items, recommended_items, accepted_items, aov_before, aov_after, latency_ms, created_date: now };
    logs.push(entry);
    return res.status(201).json(entry);
  }
  res.setHeader('Allow', ['GET','POST']);
  res.status(405).end(`Method ${method} Not Allowed`);
}