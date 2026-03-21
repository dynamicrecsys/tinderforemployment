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
      <div className="flex flex-col items-center justify-center h-[500px] text-center px-6">
        <div className="text-6xl mb-4 opacity-50">&#128533;</div>
        <p className="text-gray-500 text-lg">{emptyMessage}</p>
        <p className="text-gray-400 text-sm mt-2">Check back later for more</p>
      </div>
    );
  }

  // Show top 2 cards for visual stacking
  const visibleCards = items.slice(0, 2).reverse();

  return (
    <div className="relative h-[500px] w-full">
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
        <div className="absolute -bottom-16 left-0 right-0 flex justify-center gap-6">
          <button
            className="w-16 h-16 rounded-full bg-white shadow-lg border-2 border-red-300 flex items-center justify-center text-2xl hover:scale-110 transition-transform active:scale-95"
            onClick={() => onSwipe(items[0], 'pass')}
          >
            &#10060;
          </button>
          <button
            className="w-16 h-16 rounded-full bg-white shadow-lg border-2 border-green-300 flex items-center justify-center text-2xl hover:scale-110 transition-transform active:scale-95"
            onClick={() => onSwipe(items[0], 'like')}
          >
            &#128154;
          </button>
        </div>
      )}
    </div>
  );
}
