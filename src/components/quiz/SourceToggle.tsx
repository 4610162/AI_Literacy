"use client";

import { useState } from "react";

interface SourceToggleProps {
  sourceText: string;
  documentName: string;
  page?: number;
}

export function SourceToggle({ sourceText, documentName, page }: SourceToggleProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-3">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors"
      >
        <svg
          className={`h-3 w-3 transition-transform ${open ? "rotate-90" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        출처 보기 — {documentName}
        {page !== undefined && ` (p.${page})`}
      </button>
      {open && (
        <div className="mt-2 rounded-md border border-gray-200 bg-gray-50 p-3">
          <p className="text-xs font-medium text-gray-500 mb-1">
            📄 {documentName} {page !== undefined && `· p.${page}`}
          </p>
          <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">
            {sourceText}
          </p>
        </div>
      )}
    </div>
  );
}
