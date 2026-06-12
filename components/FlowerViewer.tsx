"use client"

import { AnimatePresence, motion } from "framer-motion"
import { X } from "lucide-react"
import { useEffect, useState } from "react"
import { TypeWriter } from "@/components/TypeWriter"
import type { Flower } from "@/types/flower"

interface FlowerViewerProps {
  flower: Flower | null
  /** id da última flor (dia 7), para disparar o evento especial */
  finalFlowerId: number
  onClose: () => void
  onFinalReveal: () => void
}

export function FlowerViewer({
  flower,
  finalFlowerId,
  onClose,
  onFinalReveal,
}: FlowerViewerProps) {
  const [messageDone, setMessageDone] = useState(false)

  // Reseta o estado da mensagem ao trocar de flor
  useEffect(() => {
    setMessageDone(false)
  }, [flower?.id])

  return (
    <AnimatePresence>
      {flower && (
        <motion.div
          key="viewer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-40 flex items-center justify-center"
        >
          {/* Camada de escurecimento + blur */}
          <motion.div
            initial={{ backdropFilter: "blur(0px)" }}
            animate={{ backdropFilter: "blur(16px)" }}
            exit={{ backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 bg-background/85"
            onClick={onClose}
          />

          {/* Glow ambiente */}
          <div className="pointer-events-none absolute top-1/3 h-72 w-72 -translate-y-1/2 rounded-full bg-primary/25 blur-[90px]" />

          {/* Conteúdo */}
          <div className="relative flex h-full w-full max-w-md flex-col items-center justify-center safe-px safe-pt safe-pb">
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar"
              className="absolute right-6 top-[max(1.5rem,env(safe-area-inset-top))] flex h-10 w-10 items-center justify-center rounded-full border border-primary/25 bg-card/60 text-foreground/80 transition-colors active:bg-card"
            >
              <X className="h-5 w-5" />
            </button>

            <motion.img
              key={`img-${flower.id}`}
              src={flower.image || "/placeholder.svg"}
              alt={flower.name}
              crossOrigin="anonymous"
              initial={{ scale: 0.2, opacity: 0, filter: "blur(12px)" }}
              animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
              transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
              className="h-52 w-52 animate-float object-contain drop-shadow-[0_0_40px_rgba(139,92,246,0.6)] sm:h-60 sm:w-60"
            />

            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="mt-6 text-center font-heading text-2xl font-semibold text-foreground text-glow"
            >
              {flower.name}
            </motion.h2>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1 }}
              className="mt-5 max-h-[34vh] overflow-y-auto px-2"
            >
              <TypeWriter
                key={`msg-${flower.id}`}
                text={flower.message}
                startDelay={1200}
                speed={42}
                onDone={() => setMessageDone(true)}
                className="text-pretty text-center text-base leading-relaxed text-foreground/85"
              />
            </motion.div>

            <AnimatePresence>
              {messageDone && flower.id === finalFlowerId && (
                <motion.button
                  type="button"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  onClick={onFinalReveal}
                  className="mt-8 rounded-full border border-primary/40 bg-primary/15 px-7 py-3 text-sm font-medium text-primary text-glow transition-transform active:scale-95"
                >
                  Continuar
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
