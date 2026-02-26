import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Filter, CheckCircle2, Clock } from "lucide-react";

export default function Logs() {
  const [mealFilter, setMealFilter] = useState("all");
  const [segmentFilter, setSegmentFilter] = useState("all");

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["recLogs"],
    queryFn: () => base44.entities.RecommendationLog.list("-created_date", 100),
    refetchInterval: 5000, // poll every 5s to pick up new logs
  });

  const filtered = logs.filter(log => {
    const mealMatch = mealFilter === "all" || log.meal_time === mealFilter;
    const segMatch = segmentFilter === "all" || log.user_segment === segmentFilter;
    return mealMatch && segMatch;
  });

  const avgAcceptRate = filtered.length > 0
    ? (filtered.reduce((sum, l) => {
        const recCount = l.recommended_items?.length || 1;
        const accCount = l.accepted_items?.length || 0;
        return sum + (accCount / recCount);
      }, 0) / filtered.length * 100).toFixed(1)
    : "0.0";

  const avgLatency = filtered.length > 0
    ? (filtered.reduce((sum, l) => sum + (l.latency_ms || 0), 0) / filtered.length).toFixed(0)
    : "0";

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Recommendation Logs</h1>
        <p className="text-sm text-muted-foreground mt-1">Track recommendation performance and acceptance metrics</p>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 border-border/50 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Filter className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Sessions</p>
            <p className="text-xl font-bold text-foreground">{filtered.length}</p>
          </div>
        </Card>
        <Card className="p-4 border-border/50 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5 text-accent" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Avg Accept Rate</p>
            <p className="text-xl font-bold text-foreground">{avgAcceptRate}%</p>
          </div>
        </Card>
        <Card className="p-4 border-border/50 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-chart-5/10 flex items-center justify-center">
            <Clock className="h-5 w-5 text-chart-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Avg Latency</p>
            <p className="text-xl font-bold text-foreground">{avgLatency}ms</p>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <Select value={mealFilter} onValueChange={setMealFilter}>
          <SelectTrigger className="w-36 h-9 text-xs"><SelectValue placeholder="Meal Time" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Meals</SelectItem>
            <SelectItem value="breakfast">Breakfast</SelectItem>
            <SelectItem value="lunch">Lunch</SelectItem>
            <SelectItem value="dinner">Dinner</SelectItem>
            <SelectItem value="late_night">Late Night</SelectItem>
          </SelectContent>
        </Select>
        <Select value={segmentFilter} onValueChange={setSegmentFilter}>
          <SelectTrigger className="w-36 h-9 text-xs"><SelectValue placeholder="Segment" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Segments</SelectItem>
            <SelectItem value="budget">Budget</SelectItem>
            <SelectItem value="premium">Premium</SelectItem>
            <SelectItem value="frequent">Frequent</SelectItem>
            <SelectItem value="occasional">Occasional</SelectItem>
            <SelectItem value="new_user">New User</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card className="border-border/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/30">
              <TableHead className="text-xs">Date</TableHead>
              <TableHead className="text-xs">Session</TableHead>
              <TableHead className="text-xs">Meal</TableHead>
              <TableHead className="text-xs">Segment</TableHead>
              <TableHead className="text-xs">Cart Items</TableHead>
              <TableHead className="text-xs">Recommended</TableHead>
              <TableHead className="text-xs">Accepted</TableHead>
              <TableHead className="text-xs">AOV Lift</TableHead>
              <TableHead className="text-xs">Latency</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? Array(5).fill(0).map((_, i) => (
              <TableRow key={i}>
                {Array(9).fill(0).map((_, j) => <TableCell key={j}><Skeleton className="h-4 w-16" /></TableCell>)}
              </TableRow>
            )) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-10 text-sm text-muted-foreground">
                  No recommendation logs yet. Use the Simulator to generate data.
                </TableCell>
              </TableRow>
            ) : filtered.map(log => {
              const lift = log.aov_after && log.aov_before ? ((log.aov_after - log.aov_before) / log.aov_before * 100).toFixed(1) : null;
              return (
                <TableRow key={log.id}>
                  <TableCell className="text-xs text-muted-foreground">
                    {log.created_date ? format(new Date(log.created_date), "MMM d, HH:mm") : "-"}
                  </TableCell>
                  <TableCell className="text-xs font-mono text-muted-foreground">{log.session_id?.slice(0, 8) || "-"}</TableCell>
                  <TableCell><Badge variant="secondary" className="text-[10px] capitalize">{log.meal_time || "-"}</Badge></TableCell>
                  <TableCell><Badge variant="outline" className="text-[10px] capitalize">{log.user_segment || "-"}</Badge></TableCell>
                  <TableCell className="text-xs">{log.cart_items?.length || 0}</TableCell>
                  <TableCell className="text-xs">{log.recommended_items?.length || 0}</TableCell>
                  <TableCell>
                    <span className="text-xs font-medium text-accent">{log.accepted_items?.length || 0}</span>
                  </TableCell>
                  <TableCell>
                    {lift ? (
                      <span className={`text-xs font-medium ${Number(lift) > 0 ? "text-accent" : "text-destructive"}`}>
                        {Number(lift) > 0 ? "+" : ""}{lift}%
                      </span>
                    ) : <span className="text-xs text-muted-foreground">-</span>}
                  </TableCell>
                  <TableCell className="text-xs tabular-nums">{log.latency_ms ? `${log.latency_ms}ms` : "-"}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}