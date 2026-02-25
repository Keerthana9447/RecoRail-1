import React from "react";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Clock, MapPin, User, UtensilsCrossed } from "lucide-react";

export default function ContextPanel({ context, onChange }) {
  return (
    <Card className="p-5 border-border/50">
      <h3 className="text-sm font-semibold text-foreground mb-4">Context Settings</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Clock className="h-3 w-3" /> Meal Time
          </Label>
          <Select value={context.mealTime} onValueChange={(v) => onChange({ ...context, mealTime: v })}>
            <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="breakfast">Breakfast</SelectItem>
              <SelectItem value="lunch">Lunch</SelectItem>
              <SelectItem value="dinner">Dinner</SelectItem>
              <SelectItem value="late_night">Late Night</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
            <UtensilsCrossed className="h-3 w-3" /> Cuisine
          </Label>
          <Select value={context.cuisine} onValueChange={(v) => onChange({ ...context, cuisine: v })}>
            <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="indian">Indian</SelectItem>
              <SelectItem value="chinese">Chinese</SelectItem>
              <SelectItem value="italian">Italian</SelectItem>
              <SelectItem value="american">American</SelectItem>
              <SelectItem value="mexican">Mexican</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
            <User className="h-3 w-3" /> User Segment
          </Label>
          <Select value={context.userSegment} onValueChange={(v) => onChange({ ...context, userSegment: v })}>
            <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="budget">Budget</SelectItem>
              <SelectItem value="premium">Premium</SelectItem>
              <SelectItem value="frequent">Frequent</SelectItem>
              <SelectItem value="occasional">Occasional</SelectItem>
              <SelectItem value="new_user">New User</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
            <MapPin className="h-3 w-3" /> City
          </Label>
          <Select value={context.city} onValueChange={(v) => onChange({ ...context, city: v })}>
            <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="mumbai">Mumbai</SelectItem>
              <SelectItem value="delhi">Delhi</SelectItem>
              <SelectItem value="bangalore">Bangalore</SelectItem>
              <SelectItem value="hyderabad">Hyderabad</SelectItem>
              <SelectItem value="chennai">Chennai</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  );
}