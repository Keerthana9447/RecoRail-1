import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const metrics = [
  { name: "AUC-ROC", value: "0.891", status: "good", desc: "Model discrimination" },
  { name: "Precision@5", value: "0.72", status: "good", desc: "Top-5 accuracy" },
  { name: "Recall@10", value: "0.64", status: "ok", desc: "Top-10 coverage" },
  { name: "NDCG@10", value: "0.78", status: "good", desc: "Ranking quality" },
  { name: "Coverage", value: "94.2%", status: "good", desc: "Scenario coverage" },
  { name: "Cold Start Acc.", value: "0.58", status: "ok", desc: "New user accuracy" },
];

export default function ModelMetricsTable() {
  return (
    <Card className="p-6 border-border/50">
      <h3 className="text-sm font-semibold text-foreground mb-4">Model Performance</h3>
      <div className="space-y-3">
        {metrics.map((m) => (
          <div key={m.name} className="flex items-center justify-between py-2 border-b border-border/40 last:border-0">
            <div>
              <p className="text-sm font-medium text-foreground">{m.name}</p>
              <p className="text-xs text-muted-foreground">{m.desc}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-foreground tabular-nums">{m.value}</span>
              <Badge
                variant="secondary"
                className={m.status === "good" ? "bg-accent/10 text-accent border-accent/20" : "bg-chart-3/10 text-chart-3 border-chart-3/20"}
              >
                {m.status === "good" ? "Strong" : "Improving"}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}