import { AnimatePresence, motion } from "framer-motion";

type Props = {
  count: number;
};

const RespectCounter = ({ count }: Props) => {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 shadow-lg">
      <p className="text-xs uppercase tracking-[0.2em] text-white/60">Karma Earned</p>
      <div className="flex items-baseline gap-2">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={count}
            initial={{ y: 10, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -10, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
            className="text-4xl font-semibold text-gold drop-shadow-glow"
          >
            {count}
          </motion.span>
        </AnimatePresence>
        <span className="text-sm text-white/60">功德 +1</span>
      </div>
    </div>
  );
};

export default RespectCounter;
