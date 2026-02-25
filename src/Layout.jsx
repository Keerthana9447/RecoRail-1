import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  LayoutDashboard,
  ShoppingCart,
  UtensilsCrossed,
  ScrollText,
  FileText,
  Menu,
  X,
  Sparkles,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { name: "Dashboard", icon: LayoutDashboard, page: "Dashboard" },
  { name: "Simulator", icon: ShoppingCart, page: "Simulator" },
  { name: "Menu Items", icon: UtensilsCrossed, page: "MenuItems" },
  { name: "Logs", icon: ScrollText, page: "Logs" },
  { name: "Documentation", icon: FileText, page: "Documentation" },
];

export default function Layout({ children, currentPageName }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-foreground/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-[260px] bg-sidebar text-sidebar-foreground flex flex-col transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-6 flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-sidebar-primary flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h1 className="text-base font-semibold tracking-tight text-sidebar-foreground">CSAO</h1>
            <p className="text-[11px] text-sidebar-foreground/50 tracking-wider uppercase">Recommender</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = currentPageName === item.page;
            return (
              <Link
                key={item.page}
                to={createPageUrl(item.page)}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-primary"
                    : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                }`}
              >
                <item.icon className={`h-[18px] w-[18px] ${isActive ? "text-sidebar-primary" : ""}`} />
                <span>{item.name}</span>
                {isActive && <ChevronRight className="h-3.5 w-3.5 ml-auto opacity-50" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mx-3 mb-4 rounded-xl bg-sidebar-accent/40 border border-sidebar-border">
          <p className="text-xs text-sidebar-foreground/50 leading-relaxed">
            AI-powered cart add-on recommendations engine for food delivery.
          </p>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border px-4 lg:px-8 h-14 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h2 className="text-sm font-semibold text-foreground tracking-tight">
            {navItems.find((n) => n.page === currentPageName)?.name || currentPageName}
          </h2>
        </header>
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}