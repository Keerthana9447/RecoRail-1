import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Pencil, Trash2, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const CATEGORIES = ["main", "side", "beverage", "dessert", "appetizer", "condiment"];
const CUISINES = ["indian", "chinese", "italian", "american", "mexican", "thai", "japanese", "mediterranean"];

function ItemForm({ item, onSave, onCancel, saving }) {
  const [form, setForm] = useState(item || {
    name: "", category: "main", cuisine: "indian", price: 0, is_veg: false, popularity_score: 50
  });

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label className="text-xs">Name</Label>
        <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-9" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs">Category</Label>
          <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
            <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {CATEGORIES.map(c => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Cuisine</Label>
          <Select value={form.cuisine} onValueChange={(v) => setForm({ ...form, cuisine: v })}>
            <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {CUISINES.map(c => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs">Price (₹)</Label>
          <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className="h-9" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Popularity (0-100)</Label>
          <Input type="number" min={0} max={100} value={form.popularity_score} onChange={(e) => setForm({ ...form, popularity_score: Number(e.target.value) })} className="h-9" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Switch checked={form.is_veg} onCheckedChange={(v) => setForm({ ...form, is_veg: v })} />
        <Label className="text-xs">Vegetarian</Label>
      </div>
      <div className="flex gap-2 justify-end pt-2">
        <Button variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
        <Button size="sm" onClick={() => onSave(form)} disabled={saving || !form.name}>
          {saving && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
          {item ? "Update" : "Create"}
        </Button>
      </div>
    </div>
  );
}

export default function MenuItems() {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const queryClient = useQueryClient();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["menuItems"],
    queryFn: () => base44.entities.MenuItem.list("-created_date", 200),
  });

  const createMut = useMutation({
    mutationFn: (data) => base44.entities.MenuItem.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["menuItems"] }); setDialogOpen(false); },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => base44.entities.MenuItem.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["menuItems"] }); setDialogOpen(false); setEditItem(null); },
  });

  const deleteMut = useMutation({
    mutationFn: (id) => base44.entities.MenuItem.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["menuItems"] }),
  });

  const filtered = items.filter(i => i.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Menu Items</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage restaurant menu items for the recommendation engine</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(v) => { setDialogOpen(v); if (!v) setEditItem(null); }}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-1.5" /> Add Item</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editItem ? "Edit Item" : "New Menu Item"}</DialogTitle></DialogHeader>
            <ItemForm
              item={editItem}
              saving={createMut.isPending || updateMut.isPending}
              onCancel={() => { setDialogOpen(false); setEditItem(null); }}
              onSave={(data) => editItem ? updateMut.mutate({ id: editItem.id, data }) : createMut.mutate(data)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search items..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      <Card className="border-border/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/30">
              <TableHead className="text-xs">Name</TableHead>
              <TableHead className="text-xs">Category</TableHead>
              <TableHead className="text-xs">Cuisine</TableHead>
              <TableHead className="text-xs">Price</TableHead>
              <TableHead className="text-xs">Type</TableHead>
              <TableHead className="text-xs">Popularity</TableHead>
              <TableHead className="text-xs w-20"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? Array(5).fill(0).map((_, i) => (
              <TableRow key={i}>
                {Array(7).fill(0).map((_, j) => (
                  <TableCell key={j}><Skeleton className="h-4 w-20" /></TableCell>
                ))}
              </TableRow>
            )) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-sm text-muted-foreground">
                  No items found. Add menu items to get started.
                </TableCell>
              </TableRow>
            ) : filtered.map(item => (
              <TableRow key={item.id} className="group">
                <TableCell className="font-medium text-sm">{item.name}</TableCell>
                <TableCell><Badge variant="secondary" className="text-xs capitalize">{item.category}</Badge></TableCell>
                <TableCell className="text-sm text-muted-foreground capitalize">{item.cuisine}</TableCell>
                <TableCell className="text-sm font-medium tabular-nums">₹{item.price}</TableCell>
                <TableCell>
                  <div className={`h-2.5 w-2.5 rounded-full ${item.is_veg ? "bg-accent" : "bg-destructive"}`} />
                </TableCell>
                <TableCell className="text-sm tabular-nums">{item.popularity_score}</TableCell>
                <TableCell>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditItem(item); setDialogOpen(true); }}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteMut.mutate(item.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}