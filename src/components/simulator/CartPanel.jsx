import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, ShoppingCart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CartPanel({ cartItems, onRemove, totalValue }) {
  return (
    <Card className="p-5 border-border/50">
      <div className="flex items-center gap-2 mb-4">
        <ShoppingCart className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Current Cart</h3>
        <Badge variant="secondary" className="ml-auto text-xs">{cartItems.length} items</Badge>
      </div>

      {cartItems.length === 0 ? (
        <div className="py-10 text-center">
          <ShoppingCart className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Add items from the menu to start</p>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {cartItems.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 group"
              >
                <div className="flex items-center gap-3">
                  <div className={`h-2 w-2 rounded-full ${item.is_veg ? "bg-accent" : "bg-destructive"}`} />
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{item.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-foreground tabular-nums">₹{item.price}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => onRemove(item.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-border/40 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Cart Total</span>
        <span className="text-lg font-bold text-foreground tabular-nums">₹{totalValue}</span>
      </div>
    </Card>
  );
}