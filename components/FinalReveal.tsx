"use client"

import { AnimatePresence, motion } from "framer-motion"
import { finalMessage } from "@/data/flowers"

interface FinalRevealProps {
  open: boolean
  onClose: () => void
}

export function FinalReveal({ open, onClose }: FinalRevealProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="fixed inset-0 z-50 flex items-center justify-center safe-px"
        >
          <motion.div
            initial={{ backdropFilter: "blur(0px)" }}
            animate={{ backdropFilter: "blur(24px)" }}
            exit={{ backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.9 }}
            className="absolute inset-0 bg-background/92"
          />

          <div
            className="pointer-events-none absolute h-80 w-80 rounded-full bg-primary/30 blur-[100px]"
            style={{ animation: "pulse-glow 6s ease-in-out infinite" }}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            className="relative w-full max-w-md rounded-[2rem] border border-primary/30 bg-card/70 px-7 py-12 text-center"
          >
            <motion.div
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, delay: 0.5, ease: "backOut" }}
              className="mx-auto mb-6 text-4xl"
              aria-hidden="true"
            >
              🌸
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="text-balance font-heading text-xl leading-relaxed text-foreground"
            >
              {finalMessage}
            </motion.p>

            <motion.button
              type="button"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.1 }}
              onClick={onClose}
              className="mt-9 rounded-full border border-primary/40 bg-primary px-9 py-3 text-sm font-medium text-primary-foreground transition-transform active:scale-95"
            >
              Concluir
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
