'use client';

import { AnimatePresence } from 'framer-motion';
import SwipeCard from './SwipeCard';

interface SwipeDeckProps<T> {
  items: T[];
  renderCard: (item: T) => React.ReactNode;
  onSwipe: (item: T, direction: 'like' | 'pass') => void;
  emptyMessage?: string;
}

export default function SwipeDeck<T extends { id: string }>({
  items,
  renderCard,
  onSwipe,
  emptyMessage = 'No more items to show',
}: SwipeDeckProps<T>) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[520px] text-center px-6">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-5">
          <span className="text-5xl">{'\u{1F50D}'}</span>
        </div>
        <p className="text-gray-700 text-lg font-semibold">{emptyMessage}</p>
        <p className="text-gray-400 text-sm mt-2">Check back later for more</p>
      </div>
    );
  }

  // Show top 2 cards for visual stacking
  const visibleCards = items.slice(0, 2).reverse();

  return (
    <div className="relative h-[490px] w-full">
      <AnimatePresence>
        {visibleCards.map((item, index) => {
          const isTop = index === visibleCards.length - 1;
          return (
            <SwipeCard
              key={item.id}
              isTop={isTop}
              onSwipe={(dir) => onSwipe(item, dir)}
            >
              {renderCard(item)}
            </SwipeCard>
          );
        })}
      </AnimatePresence>

      {/* Action buttons */}
      {items.length > 0 && (
        <div className="absolute -bottom-20 left-0 right-0 flex justify-center gap-8">
          <button
            className="w-16 h-16 rounded-full bg-white shadow-xl border-2 border-red-200 flex items-center justify-center hover:scale-110 hover:border-red-400 transition-all active:scale-95"
            onClick={() => onSwipe(items[0], 'pass')}
          >
            <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <button
            className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 shadow-xl flex items-center justify-center hover:scale-110 transition-all active:scale-95"
            onClick={() => onSwipe(items[0], 'like')}
          >
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
