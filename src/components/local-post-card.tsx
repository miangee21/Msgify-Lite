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
    id: number;
    date: string;
    text: any;
    photo: string;
    buttons?: { label: string; url: string }[];
  };
  imageFile: File | null; // Kept for backwards compatibility
  imagePath?: string; // New: filename to load
  loadImage?: (filename: string) => Promise<File | null>; // New: lazy loader function
}

export function LocalPostCard({ post, imageFile, imagePath, loadImage }: LocalPostProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 🚀 OPTIMIZATION: Lazy load image when component mounts
  useEffect(() => {
    let isMounted = true;

    const loadImageAsync = async () => {
      // If we already have a File object (old behavior), use it
      if (imageFile) {
        const url = URL.createObjectURL(imageFile);
        setImageUrl(url);
        return () => URL.revokeObjectURL(url);
      }

      // New behavior: lazy load using the loadImage function
      if (imagePath && loadImage) {
        setIsLoading(true);
        try {
          const file = await loadImage(imagePath);
          if (file && isMounted) {
            const url = URL.createObjectURL(file);
            setImageUrl(url);
            setIsLoading(false);
            
            // Cleanup
            return () => URL.revokeObjectURL(url);
          }
        } catch (err) {
          console.error("Failed to load image:", imagePath, err);
          if (isMounted) setIsLoading(false);
        }
      }
    };

    const cleanup = loadImageAsync();
    
    return () => {
      isMounted = false;
      cleanup.then(fn => fn && fn());
    };
  }, [imageFile, imagePath, loadImage]);

  // Caption Logic
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
            unoptimized
          />
        ) : (
          <div className="flex items-center justify-center h-full text-slate-400 text-xs">
            {isLoading ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-slate-500">Loading...</span>
              </div>
            ) : (
              "Image not found"
            )}
          </div>
        )}

        {/* Date Overlay */}
        <div className="absolute top-4 left-4 z-10">
          <Badge variant="secondary" className="bg-white/90 dark:bg-black/80 backdrop-blur-md shadow-sm border-0 px-3 py-1 gap-1.5 text-[10px] font-bold uppercase tracking-wider">
            <Calendar size={10} className="text-emerald-600 dark:text-emerald-400" />
            {post.date ? format(new Date(post.date), "dd MMM yyyy, hh:mm a") : "No Date"}
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

        {/* 3. Action Buttons */}
        {post.buttons && post.buttons.length > 0 && (
          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
            {post.buttons.map((btn, idx) => (
              <Button
                key={idx}
                variant="secondary"
                size="sm"
                className={cn(
                  "h-7 px-3 text-[11px] rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 border-0 justify-center transition-colors font-semibold",
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