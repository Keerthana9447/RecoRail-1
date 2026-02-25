import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";

const SAMPLE_MENU = [
  { id: "m1", name: "Chicken Biryani", category: "main", cuisine: "indian", price: 280, is_veg: false, popularity_score: 95 },
  { id: "m2", name: "Paneer Butter Masala", category: "main", cuisine: "indian", price: 220, is_veg: true, popularity_score: 90 },
  { id: "m3", name: "Butter Naan", category: "side", cuisine: "indian", price: 45, is_veg: true, popularity_score: 88 },
  { id: "m4", name: "Mirchi Ka Salan", category: "condiment", cuisine: "indian", price: 80, is_veg: true, popularity_score: 72 },
  { id: "m5", name: "Raita", category: "condiment", cuisine: "indian", price: 50, is_veg: true, popularity_score: 75 },
  { id: "m6", name: "Gulab Jamun", category: "dessert", cuisine: "indian", price: 90, is_veg: true, popularity_score: 82 },
  { id: "m7", name: "Masala Chai", category: "beverage", cuisine: "indian", price: 40, is_veg: true, popularity_score: 70 },
  { id: "m8", name: "Mango Lassi", category: "beverage", cuisine: "indian", price: 60, is_veg: true, popularity_score: 78 },
  { id: "m9", name: "Hakka Noodles", category: "main", cuisine: "chinese", price: 180, is_veg: true, popularity_score: 85 },
  { id: "m10", name: "Chicken Manchurian", category: "main", cuisine: "chinese", price: 220, is_veg: false, popularity_score: 83 },
  { id: "m11", name: "Spring Rolls", category: "appetizer", cuisine: "chinese", price: 120, is_veg: true, popularity_score: 76 },
  { id: "m12", name: "Fried Rice", category: "main", cuisine: "chinese", price: 160, is_veg: true, popularity_score: 88 },
  { id: "m13", name: "Hot & Sour Soup", category: "appetizer", cuisine: "chinese", price: 100, is_veg: false, popularity_score: 71 },
  { id: "m14", name: "Cola", category: "beverage", cuisine: "american", price: 45, is_veg: true, popularity_score: 65 },
  { id: "m15", name: "Margherita Pizza", category: "main", cuisine: "italian", price: 250, is_veg: true, popularity_score: 92 },
  { id: "m16", name: "Garlic Bread", category: "side", cuisine: "italian", price: 110, is_veg: true, popularity_score: 80 },
];

const categoryColors = {
  main: "bg-primary/10 text-primary",
  side: "bg-chart-3/10 text-chart-3",
  beverage: "bg-chart-5/10 text-chart-5",
  dessert: "bg-chart-4/10 text-chart-4",
  appetizer: "bg-accent/10 text-accent",
  condiment: "bg-muted text-muted-foreground",
};

export default function MenuBrowser({ onAdd, cartItemIds }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const categories = ["all", ...new Set(SAMPLE_MENU.map(i => i.category))];

  const filtered = SAMPLE_MENU.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = filter === "all" || item.category === filter;
    return matchSearch && matchCategory;
  });

  return (
    <Card className="p-5 border-border/50">
      <h3 className="text-sm font-semibold text-foreground mb-4">Menu Items</h3>

      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          placeholder="Search menu..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-9 text-xs"
        />
      </div>

      <div className="flex gap-1.5 mb-4 flex-wrap">
        {categories.map(cat => (
          <Button
            key={cat}
            variant={filter === cat ? "default" : "ghost"}
            size="sm"
            className="h-7 text-xs capitalize"
            onClick={() => setFilter(cat)}
          >
            {cat}
          </Button>
        ))}
      </div>

      <div className="space-y-1.5 max-h-[400px] overflow-y-auto pr-1">
        {filtered.map(item => {
          const inCart = cartItemIds.includes(item.id);
          return (
            <div
              key={item.id}
              className={`flex items-center justify-between p-2.5 rounded-lg transition-colors ${
                inCart ? "bg-primary/5 border border-primary/20" : "hover:bg-secondary/50"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`h-2 w-2 rounded-full shrink-0 ${item.is_veg ? "bg-accent" : "bg-destructive"}`} />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                  <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 mt-0.5 ${categoryColors[item.category] || ""}`}>
                    {item.category}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-2">
                <span className="text-sm font-medium text-foreground tabular-nums">₹{item.price}</span>
                <Button
                  size="sm"
                  variant={inCart ? "secondary" : "outline"}
                  className="h-7 w-7 p-0"
                  onClick={() => onAdd(item)}
                  disabled={inCart}
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}