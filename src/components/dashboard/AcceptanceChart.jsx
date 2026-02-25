import React from "react";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { segment: "Budget", rate: 28 },
  { segment: "Premium", rate: 42 },
  { segment: "Frequent", rate: 38 },
  { segment: "Occasional", rate: 22 },
  { segment: "New", rate: 31 },
];

export default function AcceptanceChart() {
  return (
    <Card className="p-6 border-border/50">
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-foreground">Acceptance Rate by Segment</h3>
        <p className="text-xs text-muted-foreground mt-1">% of recommended items added to cart</p>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis dataKey="segment" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} unit="%" />
          <Tooltip
            contentStyle={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "12px",
              fontSize: "12px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)"
            }}
          />
          <Bar dataKey="rate" fill="hsl(var(--accent))" radius={[6, 6, 0, 0]} name="Acceptance %" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}