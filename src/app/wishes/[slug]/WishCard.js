'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Copy, Check, Sparkles } from 'lucide-react';

export default function WishCard({ wish }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(wish.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  const createCardUrl = `/?wish=${encodeURIComponent(wish.text)}#create`;

  return (
    <div className="bg-white rounded-2xl p-6 border border-purple-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
      <div>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {wish.tags?.map((tag, idx) => (
            <span
              key={idx}
              className="text-[11px] font-semibold uppercase tracking-wider text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
        <blockquote className="text-gray-800 text-sm sm:text-base leading-relaxed mb-6 italic">
          "{wish.text}"
        </blockquote>
      </div>

      <div className="border-t border-gray-100 pt-4 flex items-center justify-between gap-2">
        <button
          onClick={handleCopy}
          type="button"
          aria-label="Copy wish to clipboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-purple-600 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-purple-50"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-green-600" />
              <span className="text-green-600">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Wish</span>
            </>
          )}
        </button>

        <Link
          href={createCardUrl}
          className="inline-flex items-center gap-1 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 px-3 py-1.5 rounded-lg shadow-sm transition-all hover:scale-105"
        >
          <Sparkles className="w-3 h-3" />
          <span>Use In Card</span>
        </Link>
      </div>
    </div>
  );
}
