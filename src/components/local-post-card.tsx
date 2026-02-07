"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { format } from "date-fns";
import { 
  Calendar, 
  ExternalLink 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface LocalPostProps {
  post: {
    id: number; // JSON se ID number hoti hai
    date: string;
    text: any; // Text can be array or string in JSON
    photo: string; // Path "photos/abc.jpg"
    buttons?: { label: string; url: string }[];
  };
  imageFile: File | null; // Hum direct File pass karenge
}

export function LocalPostCard({ post, imageFile }: LocalPostProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  // Memory Leak Prevention: Image URL tabhi banao jab zaroorat ho
  useEffect(() => {
    if (imageFile) {
      const url = URL.createObjectURL(imageFile);
      setImageUrl(url);
      
      // Cleanup function: Jab card screen se hatega, memory clear ho jayegi
      return () => URL.revokeObjectURL(url);
    }
  }, [imageFile]);

  // Caption Logic (JSON format handle karne k liye)
  let captionText = "";
  if (typeof post.text === "string") {
    captionText = post.text;
  } else if (Array.isArray(post.text)) {
    post.text.forEach((part: any) => {
      if (typeof part === "string") captionText += part;
      else if (part.text) captionText += part.text;
    });
  }

  return (
    <div className="group relative flex flex-col bg-white dark:bg-zinc-900 rounded-[2rem] border border-slate-200 dark:border-zinc-800 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
      
      {/* 1. Image Area */}
      <div className="relative w-full aspect-[4/5] bg-slate-100 dark:bg-zinc-950 overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt="Local Post Image"
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            unoptimized // Local blobs k liye zaroori hai
          />
        ) : (
          <div className="flex items-center justify-center h-full text-slate-400 text-xs">
            Image not found
          </div>
        )}

        {/* Date Overlay */}
        <div className="absolute top-4 left-4">
          <Badge variant="secondary" className="bg-white/90 dark:bg-black/80 backdrop-blur-md shadow-sm border-0 px-3 py-1 gap-1.5 text-[10px] font-bold uppercase tracking-wider">
            <Calendar size={10} className="text-emerald-600 dark:text-emerald-400" />
            {/* JSON date string hoti hai, isliye new Date() zaroori hai */}
            {format(new Date(post.date), "dd MMM yyyy, hh:mm a")}
          </Badge>
        </div>
      </div>

      {/* 2. Content Area */}
      <div className="flex flex-col p-4 gap-3">
        <div className="min-h-[40px]">
          <p className="text-[13px] text-slate-600 dark:text-zinc-300 leading-snug line-clamp-3 font-medium">
            {captionText || "No caption provided."}
          </p>
        </div>

        {/* 3. Action Buttons (Updated Grid Logic) */}
        {post.buttons && post.buttons.length > 0 && (
          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
            {post.buttons.map((btn, idx) => (
              <Button
                key={idx}
                variant="secondary"
                size="sm"
                className={cn(
                  "h-7 px-3 text-[11px] rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 border-0 justify-center transition-colors font-semibold",
                  // Logic: Agar ye last button hai AUR total buttons ODD hain, to full width (col-span-2)
                  (idx === post.buttons!.length - 1 && post.buttons!.length % 2 !== 0)
                    ? "col-span-2 w-full"
                    : "col-span-1"
                )}
                asChild
              >
                <a href={btn.url} target="_blank" rel="noopener noreferrer">
                  {btn.label}
                  <ExternalLink size={10} className="ml-1 opacity-70" />
                </a>
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}