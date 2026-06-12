"use client"

import { motion } from "framer-motion"
import type { Flower } from "@/types/flower"

interface FlowerCardProps {
  flower: Flower
  index: number
  onSelect: (flower: Flower) => void
}

export function FlowerCard({ flower, index, onSelect }: FlowerCardProps) {
  return (
    <motion.button
      type="button"
      onClick={() => onSelect(flower)}
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.06 * index, ease: "easeOut" }}
      whileTap={{ scale: 0.95 }}
      aria-label={`Abrir ${flower.name}`}
      className="group relative flex aspect-square flex-col items-center justify-center overflow-hidden rounded-3xl border border-primary/20 bg-card/50"
    >
      <span className="pointer-events-none absolute inset-0 bg-primary/10 opacity-0 blur-2xl transition-opacity duration-500 group-active:opacity-100" />
      <span
        className="pointer-events-none absolute -bottom-6 h-24 w-24 rounded-full bg-primary/25 blur-3xl"
        style={{ animation: "pulse-glow 5s ease-in-out infinite" }}
      />
      <img
        src={flower.image || "/placeholder.svg"}
        alt={flower.name}
        className="relative h-3/4 w-3/4 object-contain drop-shadow-[0_0_22px_rgba(139,92,246,0.45)] transition-transform duration-500 group-active:scale-105"
        crossOrigin="anonymous"
      />
      <span className="relative mt-1 px-2 text-center text-sm font-medium text-foreground/90">
        {flower.name}
      </span>
    </motion.button>
  )
}
