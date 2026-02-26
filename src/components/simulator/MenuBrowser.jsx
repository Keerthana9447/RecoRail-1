import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

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

  const { data: menuItems = [], isLoading } = useQuery({
    queryKey: ["menuItems"],
    queryFn: () =>
      fetch("http://localhost:8000/menu-items")
        .then(res => res.json())
        .catch(() => []),
    refetchInterval: 5000, // Refetch every 5 seconds to catch updates
  });

  const categories = ["all", ...new Set(menuItems.map(i => i.category))];

  const filtered = menuItems.filter(item => {
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
          disabled={isLoading}
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
            disabled={isLoading}
          >
            {cat}
          </Button>
        ))}
      </div>

      <div className="space-y-1.5 max-h-[400px] overflow-y-auto pr-1">
        {isLoading ? (
          Array(5).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))
        ) : filtered.length === 0 ? (
          <div className="text-center py-6 text-sm text-muted-foreground">
            {menuItems.length === 0 ? "No menu items yet. Add some items first." : "No items matching filters"}
          </div>
        ) : (
          filtered.map(item => {
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
          })
        )}
      </div>
    </Card>
  );
}