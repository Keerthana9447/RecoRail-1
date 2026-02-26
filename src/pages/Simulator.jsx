import React, { useState, useCallback, useEffect } from "react";
import CartPanel from "../components/simulator/CartPanel";
import RecommendationRail from "../components/simulator/RecommendationRail";
import ContextPanel from "../components/simulator/ContextPanel";
import MenuBrowser from "../components/simulator/MenuBrowser";

// Get recommendations from backend
async function getRecommendations(cartItems, context) {
  if (cartItems.length === 0) return [];

  try {
    const response = await fetch("http://localhost:8000/recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cart_items: cartItems,
        meal_time: context.mealTime,
        cuisine: context.cuisine,
        user_segment: context.userSegment,
        city: context.city,
      }),
    });

    const data = await response.json();
    return data.recommendations || [];
  } catch (err) {
    console.error("Error getting recommendations:", err);
    return [];
  }
}

export default function Simulator() {
  const [cartItems, setCartItems] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState({
    mealTime: "dinner",
    cuisine: "indian",
    userSegment: "frequent",
    city: "hyderabad"
  });

  const fetchRecommendations = useCallback(async (items) => {
    if (items.length === 0) {
      setRecommendations([]);
      return;
    }
    setLoading(true);
    const recs = await getRecommendations(items, context);
    setRecommendations(recs);
    setLoading(false);
  }, [context]);

  const addToCart = useCallback((item) => {
    const newCart = [...cartItems, item];
    setCartItems(newCart);
    fetchRecommendations(newCart);
  }, [cartItems, fetchRecommendations]);

  const removeFromCart = useCallback((id) => {
    const newCart = cartItems.filter(i => i.id !== id);
    setCartItems(newCart);
    fetchRecommendations(newCart);
  }, [cartItems, fetchRecommendations]);

  const addRecommendation = useCallback((rec) => {
    const item = { ...rec, id: `rec_${Date.now()}` };
    const newCart = [...cartItems, item];
    setCartItems(newCart);
    fetchRecommendations(newCart);
  }, [cartItems, fetchRecommendations]);

  const totalValue = cartItems.reduce((sum, i) => sum + (i.price || 0), 0);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Cart Simulator</h1>
        <p className="text-sm text-muted-foreground mt-1">Test the recommendation engine with different cart compositions and contexts</p>
      </div>

      <ContextPanel context={context} onChange={setContext} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <MenuBrowser onAdd={addToCart} cartItemIds={cartItems.map(i => i.id)} />
        <CartPanel cartItems={cartItems} onRemove={removeFromCart} totalValue={totalValue} />
        <RecommendationRail recommendations={recommendations} onAdd={addRecommendation} loading={loading} />
      </div>
    </div>
  );
}