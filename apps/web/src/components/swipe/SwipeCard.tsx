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
  const rotate = useTransform(x, [-200, 200], [-12, 12]);
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
      animate={isTop ? {} : { scale: 0.96, y: 12 }}
      exit={{
        x: x.get() > 0 ? 400 : -400,
        opacity: 0,
        transition: { duration: 0.4 },
      }}
    >
      {/* Like / Pass indicators */}
      {isTop && (
        <>
          <motion.div
            className="absolute top-6 left-5 z-20 px-5 py-2 bg-green-500 text-white font-black text-xl rounded-xl -rotate-12 shadow-lg"
            style={{ opacity: likeOpacity }}
          >
            LIKE
          </motion.div>
          <motion.div
            className="absolute top-6 right-5 z-20 px-5 py-2 bg-red-500 text-white font-black text-xl rounded-xl rotate-12 shadow-lg"
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
