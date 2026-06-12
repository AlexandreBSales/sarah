"use client"

import { motion } from "framer-motion"
import { Check, Lock } from "lucide-react"
import type { Flower } from "@/types/flower"
import { formatDate } from "@/utils/date"

interface DayTimelineProps {
  timeline: { flower: Flower; unlocked: boolean }[]
  onSelect: (flower: Flower) => void
}

export function DayTimeline({ timeline, onSelect }: DayTimelineProps) {
  return (
    <ul className="flex w-full flex-col gap-3" aria-label="Linha do tempo das flores">
      {timeline.map(({ flower, unlocked }, index) => (
        <motion.li
          key={flower.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 * index, ease: "easeOut" }}
        >
          <button
            type="button"
            disabled={!unlocked}
            onClick={() => unlocked && onSelect(flower)}
            aria-label={
              unlocked
                ? `Dia ${flower.id}: ${flower.name}, liberada. Toque para abrir.`
                : `Dia ${flower.id}: bloqueada até ${formatDate(flower.unlockDate)}`
            }
            className={`group relative flex w-full items-center gap-4 overflow-hidden rounded-2xl border px-4 py-4 text-left transition-all duration-300 ${
              unlocked
                ? "border-primary/25 bg-card/60 active:scale-[0.98]"
                : "border-border/40 bg-card/30"
            }`}
          >
            {unlocked && (
              <span className="pointer-events-none absolute -left-8 top-1/2 h-24 w-24 -translate-y-1/2 rounded-full bg-primary/20 blur-2xl transition-opacity duration-300 group-active:opacity-80" />
            )}

            <span
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border text-sm font-medium ${
                unlocked
                  ? "border-primary/40 bg-primary/15 text-primary text-glow"
                  : "border-border/50 bg-muted/40 text-muted-foreground"
              }`}
            >
              {flower.id}
            </span>

            <span className="flex min-w-0 flex-1 flex-col">
              <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Dia {flower.id}
              </span>
              <span
                className={`truncate text-base font-medium ${
                  unlocked ? "text-foreground" : "text-muted-foreground/70"
                }`}
              >
                {unlocked ? flower.name : "A descobrir"}
              </span>
            </span>

            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                unlocked ? "text-primary" : "text-muted-foreground/60"
              }`}
            >
              {unlocked ? (
                <Check className="h-5 w-5" strokeWidth={2.5} />
              ) : (
                <Lock className="h-4 w-4" strokeWidth={2} />
              )}
            </span>
          </button>
        </motion.li>
      ))}
    </ul>
  )
}
