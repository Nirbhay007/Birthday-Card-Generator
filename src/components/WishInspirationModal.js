'use client';

import React, { useState } from 'react';
import { X, Sparkles, Check, Heart, Laugh, Users, Award, MessageCircle } from 'lucide-react';
import { WISH_CATEGORIES } from '@/lib/wishesData';

const ICONS = {
  'best-friend': Users,
  'funny': Laugh,
  'romantic': Heart,
  'family': Heart,
  'milestones': Award,
  'short-sweet': MessageCircle,
};

export default function WishInspirationModal({ isOpen, onClose, onSelectWish }) {
  const [activeCategory, setActiveCategory] = useState(WISH_CATEGORIES[0].slug);
  const [selectedWishId, setSelectedWishId] = useState(null);

  if (!isOpen) return null;

  const currentCategory = WISH_CATEGORIES.find((c) => c.slug === activeCategory) || WISH_CATEGORIES[0];

  const handlePick = (wish) => {
    setSelectedWishId(wish.id);
    onSelectWish(wish.text);
    setTimeout(() => {
      setSelectedWishId(null);
      onClose();
    }, 300);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-purple-100 overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-purple-50 via-pink-50 to-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 id="modal-title" className="text-lg font-bold text-gray-900 leading-tight">
                Birthday Wish Inspiration
              </h2>
              <p className="text-xs text-gray-500">Pick any wish to instantly paste it into your card</p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            aria-label="Close inspiration modal"
            className="p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="px-5 pt-3 pb-2 border-b border-gray-100 flex gap-2 overflow-x-auto no-scrollbar scroll-smooth">
          {WISH_CATEGORIES.map((cat) => {
            const Icon = ICONS[cat.slug] || Sparkles;
            const isActive = cat.slug === activeCategory;
            return (
              <button
                key={cat.slug}
                onClick={() => setActiveCategory(cat.slug)}
                type="button"
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-purple-50 hover:text-purple-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.navTitle}</span>
              </button>
            );
          })}
        </div>

        {/* Wishes List */}
        <div className="p-5 overflow-y-auto space-y-3.5 flex-1">
          {currentCategory.wishes.map((wish) => {
            const isPicked = selectedWishId === wish.id;
            return (
              <div
                key={wish.id}
                onClick={() => handlePick(wish)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer group flex flex-col justify-between ${
                  isPicked
                    ? 'border-green-500 bg-green-50/50 ring-2 ring-green-200'
                    : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/30'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex gap-1.5 flex-wrap">
                    {wish.tags?.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-semibold uppercase tracking-wider text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  {isPicked ? (
                    <span className="text-xs text-green-600 font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Inserted!
                    </span>
                  ) : (
                    <span className="text-xs text-purple-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      Use this wish →
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-700 leading-relaxed italic">"{wish.text}"</p>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <span>Click any wish to use it instantly</span>
          <button
            onClick={onClose}
            type="button"
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
