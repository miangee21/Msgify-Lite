"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

export default function LocalPaginationControls({
  currentPage,
  totalPages,
  totalCount,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
}) {

  // ✅ New Wrapper Function to handle Scroll + Page Change
  const handlePageChange = (page: number) => {
    // 1. Data update karo
    onPageChange(page);
    
    // 2. Smoothly oper le jao
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const renderPageNumbers = () => {
    const pages = [];
    const showEllipsis = totalPages > 5;

    if (!showEllipsis) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage, "...", totalPages);
      }
    }

    return pages.map((p, idx) => (
      <div key={idx} className="flex items-center">
        {p === "..." ? (
          <MoreHorizontal className="text-slate-400 mx-1" size={16} />
        ) : (
          <Button
            variant={currentPage === p ? "default" : "outline"}
            size="sm"
            // 👇 Updated to use handlePageChange
            onClick={() => handlePageChange(p as number)}
            className={`w-9 h-9 rounded-xl transition-all ${
              // Local Viewer Theme: Emerald (Green) instead of Indigo
              currentPage === p ? "bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-200 dark:shadow-none" : ""
            }`}
          >
            {p}
          </Button>
        )}
      </div>
    ));
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between w-full border-t border-slate-200 dark:border-zinc-800 pt-8 mt-12 gap-4">
      <div className="text-sm text-slate-500 dark:text-zinc-400">
        Showing page <span className="font-bold text-slate-900 dark:text-zinc-100">{currentPage}</span> of {totalPages} ({totalCount} posts)
      </div>

      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="icon"
          disabled={currentPage <= 1}
          // 👇 Updated to use handlePageChange
          onClick={() => handlePageChange(currentPage - 1)}
          className="rounded-xl h-9 w-9"
        >
          <ChevronLeft size={18} />
        </Button>

        <div className="flex items-center gap-1.5 mx-2">
          {renderPageNumbers()}
        </div>

        <Button
          variant="outline"
          size="icon"
          disabled={currentPage >= totalPages}
          // 👇 Updated to use handlePageChange
          onClick={() => handlePageChange(currentPage + 1)}
          className="rounded-xl h-9 w-9"
        >
          <ChevronRight size={18} />
        </Button>
      </div>
    </div>
  );
}