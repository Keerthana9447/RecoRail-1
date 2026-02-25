import React from "react";
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function MetricCard({ title, value, subtitle, trend, trendUp, icon: Icon, color = "primary" }) {
  const colorMap = {
    primary: "bg-primary/10 text-primary",
    accent: "bg-accent/10 text-accent",
    chart3: "bg-chart-3/10 text-chart-3",
    chart4: "bg-chart-4/10 text-chart-4",
    chart5: "bg-chart-5/10 text-chart-5",
  };

  return (
    <Card className="p-5 relative overflow-hidden group hover:shadow-lg transition-shadow duration-300 border-border/50">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold text-foreground tracking-tight">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-xl ${colorMap[color] || colorMap.primary}`}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
      {trend && (
        <div className={`flex items-center gap-1 mt-3 text-xs font-medium ${trendUp ? "text-accent" : "text-destructive"}`}>
          {trendUp ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
          <span>{trend}</span>
        </div>
      )}
      <div className={`absolute -bottom-4 -right-4 h-24 w-24 rounded-full opacity-[0.04] group-hover:opacity-[0.08] transition-opacity ${colorMap[color]?.split(" ")[0] || "bg-primary"}`} />
    </Card>
  );
}