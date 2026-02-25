import React, { useState, useCallback, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import CartPanel from "../components/simulator/CartPanel";
import RecommendationRail from "../components/simulator/RecommendationRail";
import ContextPanel from "../components/simulator/ContextPanel";
import MenuBrowser from "../components/simulator/MenuBrowser";

// Simulated recommendation engine using LLM
async function getRecommendations(cartItems, context) {
  if (cartItems.length === 0) return [];

  const cartDesc = cartItems.map(i => `${i.name} (${i.category}, ₹${i.price}, ${i.is_veg ? "veg" : "non-veg"})`).join(", ");

  const result = await base44.integrations.Core.InvokeLLM({
    prompt: `You are a food delivery recommendation engine. Given the current cart and context, suggest exactly 6 complementary add-on items that would complete the meal. Be contextually relevant.

Current cart: ${cartDesc}
Meal time: ${context.mealTime}
Cuisine preference: ${context.cuisine}
User segment: ${context.userSegment} (${context.userSegment === "budget" ? "price sensitive, suggest affordable items" : context.userSegment === "premium" ? "open to premium items and larger portions" : "balanced preferences"})
City: ${context.city}

Rules:
- Don't recommend items already in cart
- Suggest items that complement what's there (e.g., biryani needs salan, pizza needs beverage)
- Include a mix of categories (sides, beverages, desserts, condiments)
- Score each item 0-1 based on how complementary it is
- Prices should be realistic for Indian food delivery`,
    response_json_schema: {
      type: "object",
      properties: {
        recommendations: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              category: { type: "string", enum: ["main", "side", "beverage", "dessert", "appetizer", "condiment"] },
              price: { type: "number" },
              is_veg: { type: "boolean" },
              score: { type: "number" },
              reason: { type: "string" }
            }
          }
        }
      }
    }
  });

  return result.recommendations || [];
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