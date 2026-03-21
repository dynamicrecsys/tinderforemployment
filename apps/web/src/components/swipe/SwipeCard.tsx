'use client';

import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';

interface SwipeCardProps {
  children: React.ReactNode;
  onSwipe: (direction: 'like' | 'pass') => void;
  isTop: boolean;
}

const SWIPE_THRESHOLD = 100;

export default function SwipeCard({ children, onSwipe, isTop }: SwipeCardProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const likeOpacity = useTransform(x, [0, SWIPE_THRESHOLD], [0, 1]);
  const passOpacity = useTransform(x, [-SWIPE_THRESHOLD, 0], [1, 0]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x > SWIPE_THRESHOLD) {
      onSwipe('like');
    } else if (info.offset.x < -SWIPE_THRESHOLD) {
      onSwipe('pass');
    }
  };

  return (
    <motion.div
      className="absolute w-full"
      style={{ x, rotate }}
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      animate={isTop ? {} : { scale: 0.95, y: 10 }}
      exit={{
        x: x.get() > 0 ? 300 : -300,
        opacity: 0,
        transition: { duration: 0.3 },
      }}
    >
      {/* Like / Pass indicators */}
      {isTop && (
        <>
          <motion.div
            className="absolute top-6 left-6 z-10 px-4 py-2 border-4 border-green-500 text-green-500 font-bold text-2xl rounded-lg -rotate-12"
            style={{ opacity: likeOpacity }}
          >
            LIKE
          </motion.div>
          <motion.div
            className="absolute top-6 right-6 z-10 px-4 py-2 border-4 border-red-500 text-red-500 font-bold text-2xl rounded-lg rotate-12"
            style={{ opacity: passOpacity }}
          >
            NOPE
          </motion.div>
        </>
      )}
      {children}
    </motion.div>
  );
}
