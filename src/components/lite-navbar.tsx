"use client";

import React from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Moon, Sun, Sparkles, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Props interface taake Parent (Page) se state control ho sake
interface LiteNavbarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function LiteNavbar({ searchQuery, setSearchQuery }: LiteNavbarProps) {
  const { theme, setTheme } = useTheme();

  // --- Theme Toggle Logic ---
  const toggleTheme = () => {
    if (theme === "dark") {
      setTheme("light");
    } else {
      setTheme("dark");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#17212b]/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        
        {/* --- LEFT SIDE: Logo --- */}
        <div className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Sparkles className="text-white" size={18} />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Msgify <span className="text-emerald-500 font-medium">Lite</span>
            </span>
        </div>

        {/* --- CENTER: Search Bar (Functional) --- */}
        <div className="flex-1 max-w-md hidden md:block relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <Input 
                placeholder="Search local archive..." 
                className="pl-9 h-10 rounded-xl bg-slate-100 dark:bg-slate-800/50 border-transparent focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
        </div>

        {/* --- RIGHT SIDE: Actions --- */}
        <div className="flex items-center gap-3">

          {/* Theme Toggle (Copy-Paste from Main) */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-xl relative hover:bg-slate-100 dark:hover:bg-slate-800"
            onClick={toggleTheme}
          >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* Decoration Avatar (Non-clickable) */}
          <div className="h-10 w-10 rounded-full bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900 flex items-center justify-center cursor-default">
             <User className="text-indigo-600 dark:text-indigo-400" size={20} />
          </div>

        </div>
      </div>

      {/* Mobile Search (Visible only on small screens below header) */}
      <div className="md:hidden px-4 pb-3 border-b border-slate-100 dark:border-slate-800/50">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <Input 
                    placeholder="Search..." 
                    className="pl-9 h-10 rounded-xl bg-slate-100 dark:bg-slate-800/50 border-transparent"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
      </div>
    </header>
  );
}