import React, { useState, useCallback } from "react";
import CartPanel from "../components/simulator/CartPanel";
import RecommendationRail from "../components/simulator/RecommendationRail";
import ContextPanel from "../components/simulator/ContextPanel";
import MenuBrowser from "../components/simulator/MenuBrowser";
import { base44 } from "@/api/base44Client";

// Get recommendations from backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";
async function getRecommendations(cartItems, context) {
  if (cartItems.length === 0) return [];

  try {
    const response = await fetch(`${API_BASE_URL}/api/recommend`, {
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
  const [sessionId] = useState(() => `session_${Date.now()}`);

  const sumPrice = items => items.reduce((s, it) => s + (it.price || 0), 0);

  async function createLog(logData) {
    try {
      await base44.entities.RecommendationLog.create(logData);
    } catch (err) {
      console.error("Error creating log:", err);
    }
  }

  const logEvent = useCallback((cartBefore, recs, acceptedItems) => {
    const aovBefore = sumPrice(cartBefore);
    const aovAfter = sumPrice([...cartBefore, ...acceptedItems]);
    const payload = {
      session_id: sessionId,
      meal_time: context.mealTime,
      user_segment: context.userSegment,
      city: context.city,
      cart_items: cartBefore,
      recommended_items: recs,
      accepted_items: acceptedItems,
      aov_before: aovBefore,
      aov_after: aovAfter,
      latency_ms: 0,
    };
    createLog(payload);
  }, [context, sessionId]);

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
    const cartBefore = [...cartItems];
    const newCart = [...cartItems, item];
    setCartItems(newCart);
    fetchRecommendations(newCart);
    // log the manual add
    logEvent(cartBefore, recommendations, [item]);
  }, [cartItems, fetchRecommendations, logEvent, recommendations]);

  const removeFromCart = useCallback((id) => {
    const newCart = cartItems.filter(i => i.id !== id);
    setCartItems(newCart);
    fetchRecommendations(newCart);
  }, [cartItems, fetchRecommendations]);

  const addRecommendation = useCallback((rec) => {
    const cartBefore = [...cartItems];
    const item = { ...rec, id: `rec_${Date.now()}` };
    const newCart = [...cartItems, item];
    setCartItems(newCart);
    fetchRecommendations(newCart);
    // log the recommendation acceptance
    logEvent(cartBefore, recommendations, [item]);
  }, [cartItems, fetchRecommendations, logEvent, recommendations]);

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