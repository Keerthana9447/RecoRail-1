import React from "react";
import { Card } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { day: "Mon", baseline: 285, withCSAO: 342 },
  { day: "Tue", baseline: 290, withCSAO: 358 },
  { day: "Wed", baseline: 278, withCSAO: 349 },
  { day: "Thu", baseline: 295, withCSAO: 367 },
  { day: "Fri", baseline: 310, withCSAO: 395 },
  { day: "Sat", baseline: 325, withCSAO: 418 },
  { day: "Sun", baseline: 315, withCSAO: 402 },
];

export default function AOVChart() {
  return (
    <Card className="p-6 border-border/50">
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-foreground">AOV Lift Over Time</h3>
        <p className="text-xs text-muted-foreground mt-1">Baseline vs. with CSAO recommendations</p>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorBaseline" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.1} />
              <stop offset="95%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorCSAO" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="day" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "12px",
              fontSize: "12px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)"
            }}
          />
          <Area type="monotone" dataKey="baseline" stroke="hsl(var(--muted-foreground))" fill="url(#colorBaseline)" strokeWidth={2} name="Baseline" />
          <Area type="monotone" dataKey="withCSAO" stroke="hsl(var(--primary))" fill="url(#colorCSAO)" strokeWidth={2} name="With CSAO" />
        </AreaChart>
      </ResponsiveContainer>
      <div className="flex gap-6 mt-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="h-2 w-2 rounded-full bg-muted-foreground" /> Baseline
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="h-2 w-2 rounded-full bg-primary" /> With CSAO
        </div>
      </div>
    </Card>
  );
}