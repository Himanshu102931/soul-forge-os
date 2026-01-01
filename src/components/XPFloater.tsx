import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FloatingXP {
  id: number;
  x: number;
  y: number;
  amount: number;
}

let floaterId = 0;
const floaterCallbacks: ((xp: FloatingXP) => void)[] = [];

export function showXPFloater(x: number, y: number, amount: number) {
  const floater: FloatingXP = { id: floaterId++, x, y, amount };
  floaterCallbacks.forEach(cb => cb(floater));
}

export function XPFloaterContainer() {
  const [floaters, setFloaters] = useState<FloatingXP[]>([]);

  useEffect(() => {
    const callback = (floater: FloatingXP) => {
      setFloaters(prev => [...prev, floater]);
      setTimeout(() => {
        setFloaters(prev => prev.filter(f => f.id !== floater.id));
      }, 1500);
    };

    floaterCallbacks.push(callback);
    return () => {
      const index = floaterCallbacks.indexOf(callback);
      if (index > -1) floaterCallbacks.splice(index, 1);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <AnimatePresence>
        {floaters.map(floater => (
          <motion.div
            key={floater.id}
            initial={{ opacity: 1, scale: 1, x: floater.x, y: floater.y }}
            animate={{ 
              opacity: 0, 
              scale: 1.3, 
              y: floater.y - 80,
              x: floater.x 
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="absolute text-xp font-bold text-lg text-glow-xp"
            style={{ left: 0, top: 0 }}
          >
            +{floater.amount} XP
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
