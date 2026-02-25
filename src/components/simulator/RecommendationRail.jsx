import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Plus, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function RecommendationRail({ recommendations, onAdd, loading }) {
  return (
    <Card className="p-5 border-border/50 border-primary/20 bg-primary/[0.02]">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Recommended Add-ons</h3>
        {loading && <Loader2 className="h-3.5 w-3.5 animate-spin text-primary ml-auto" />}
      </div>

      {loading ? (
        <div className="py-8 text-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Generating recommendations...</p>
        </div>
      ) : recommendations.length === 0 ? (
        <div className="py-8 text-center">
          <Sparkles className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Add items to cart to see recommendations</p>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {recommendations.map((rec, idx) => (
              <motion.div
                key={rec.name + idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center justify-between p-3 rounded-lg bg-card border border-border/40 hover:border-primary/30 transition-colors group"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex flex-col items-center min-w-[28px]">
                    <span className="text-[10px] font-bold text-primary/60">#{idx + 1}</span>
                  </div>
                  <div className={`h-2 w-2 rounded-full shrink-0 ${rec.is_veg ? "bg-accent" : "bg-destructive"}`} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{rec.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground capitalize">{rec.category}</span>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-primary/20 text-primary">
                        {(rec.score * 100).toFixed(0)}% match
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <span className="text-sm font-semibold text-foreground tabular-nums">₹{rec.price}</span>
                  <Button
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => onAdd(rec)}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {recommendations.length > 0 && !loading && (
        <p className="text-[10px] text-muted-foreground mt-4 text-center">
          Latency: ~185ms · Model v2.4 · Context-aware ranking
        </p>
      )}
    </Card>
  );
}