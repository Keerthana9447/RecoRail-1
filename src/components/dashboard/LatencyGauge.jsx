import React from "react";
import { Card } from "@/components/ui/card";
import { RadialBarChart, RadialBar, ResponsiveContainer } from "recharts";

export default function LatencyGauge() {
  const latency = 185;
  const maxLatency = 300;
  const pct = Math.min((latency / maxLatency) * 100, 100);

  const data = [
    { name: "latency", value: pct, fill: latency <= 200 ? "hsl(var(--accent))" : latency <= 300 ? "hsl(var(--chart-3))" : "hsl(var(--destructive))" },
  ];

  return (
    <Card className="p-6 border-border/50 flex flex-col items-center">
      <div className="w-full mb-2">
        <h3 className="text-sm font-semibold text-foreground">P95 Latency</h3>
        <p className="text-xs text-muted-foreground mt-1">Inference response time</p>
      </div>
      <div className="relative w-40 h-40">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" startAngle={180} endAngle={0} data={data}>
            <RadialBar background={{ fill: "hsl(var(--muted))" }} dataKey="value" cornerRadius={10} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-4">
          <span className="text-3xl font-bold text-foreground">{latency}</span>
          <span className="text-xs text-muted-foreground">ms</span>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-2">
        <div className="h-2 w-2 rounded-full bg-accent" />
        <span className="text-xs text-muted-foreground">Within target (&lt;300ms)</span>
      </div>
    </Card>
  );
}