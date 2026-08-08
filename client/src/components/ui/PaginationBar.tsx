import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationBarProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function PaginationBar({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange
}: PaginationBarProps) {
  if (totalPages <= 1) return null;

  // Generate page numbers array with clean windowing (e.g. 1, 2, 3 ... 14)
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 3) {
        end = 4;
      } else if (currentPage >= totalPages - 2) {
        start = totalPages - 3;
      }

      if (start > 2) pages.push('...');
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }

    return pages;
  };

  const startIdx = (currentPage - 1) * pageSize + 1;
  const endIdx = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="py-6 px-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200 dark:border-slate-800 my-6 bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl p-4">
      <div className="text-xs text-slate-600 dark:text-slate-400 font-semibold">
        Showing <span className="text-emerald-600 dark:text-emerald-400 font-bold">{startIdx.toLocaleString()}</span> – <span className="text-emerald-600 dark:text-emerald-400 font-bold">{endIdx.toLocaleString()}</span> of <span className="font-bold text-slate-900 dark:text-white">{totalItems.toLocaleString()}</span> foods in A-Z order
        <span className="ml-2 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-black text-[10px]">
          100 Foods Per Page
        </span>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap justify-center">
        {/* First Page */}
        <Button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0 rounded-lg"
          title="First Page"
        >
          <ChevronsLeft className="w-4 h-4" />
        </Button>

        {/* Previous Page */}
        <Button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          variant="outline"
          size="sm"
          className="h-8 px-2.5 rounded-lg text-xs font-bold gap-1"
        >
          <ChevronLeft className="w-4 h-4" /> Prev
        </Button>

        {/* Page Number Buttons */}
        {getPageNumbers().map((p, idx) => (
          typeof p === 'number' ? (
            <Button
              key={idx}
              onClick={() => onPageChange(p)}
              variant={currentPage === p ? 'default' : 'outline'}
              size="sm"
              className={`h-8 w-8 p-0 rounded-lg text-xs font-extrabold ${
                currentPage === p
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                  : 'hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
              }`}
            >
              {p}
            </Button>
          ) : (
            <span key={idx} className="px-1 text-slate-400 font-mono text-xs">...</span>
          )
        ))}

        {/* Next Page */}
        <Button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          variant="outline"
          size="sm"
          className="h-8 px-2.5 rounded-lg text-xs font-bold gap-1"
        >
          Next <ChevronRight className="w-4 h-4" />
        </Button>

        {/* Last Page */}
        <Button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0 rounded-lg"
          title="Last Page"
        >
          <ChevronsRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
