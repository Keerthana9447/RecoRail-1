import React from "react";
import MetricCard from "../components/dashboard/MetricCard";
import AOVChart from "../components/dashboard/AOVChart";
import AcceptanceChart from "../components/dashboard/AcceptanceChart";
import LatencyGauge from "../components/dashboard/LatencyGauge";
import ModelMetricsTable from "../components/dashboard/ModelMetricsTable";
import { ShoppingCart, TrendingUp, MousePointerClick, Layers, Zap } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Hero */}
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Recommendation Engine</h1>
        <p className="text-sm text-muted-foreground mt-1">Real-time cart add-on suggestion system performance overview</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard title="AOV Lift" value="+18.7%" subtitle="₹285 → ₹338" trend="+2.3% vs last week" trendUp icon={TrendingUp} color="primary" />
        <MetricCard title="Accept Rate" value="34.2%" subtitle="CSAO rail items" trend="+5.1% vs last week" trendUp icon={MousePointerClick} color="accent" />
        <MetricCard title="Rail Order Share" value="41.6%" subtitle="Orders via CSAO" trend="+3.8% vs baseline" trendUp icon={Layers} color="chart3" />
        <MetricCard title="Avg Items/Order" value="3.4" subtitle="Up from 2.6" trend="+0.3 items" trendUp icon={ShoppingCart} color="chart4" />
        <MetricCard title="C2O Rate" value="72.8%" subtitle="Cart to order" trend="+1.2% improvement" trendUp icon={Zap} color="chart5" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AOVChart />
        <AcceptanceChart />
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ModelMetricsTable />
        </div>
        <LatencyGauge />
      </div>
    </div>
  );
}