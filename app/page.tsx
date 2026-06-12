"use client"

import { AnimatePresence, motion } from "framer-motion"
import { useState } from "react"
import { DayTimeline } from "@/components/DayTimeline"
import { FinalReveal } from "@/components/FinalReveal"
import { FlowerCard } from "@/components/FlowerCard"
import { FlowerViewer } from "@/components/FlowerViewer"
import { flowers } from "@/data/flowers"
import { useUnlockedFlowers } from "@/hooks/useUnlockedFlowers"
import type { Flower } from "@/types/flower"

const FINAL_FLOWER_ID = flowers[flowers.length - 1].id

export default function Page() {
  const { unlocked, timeline, ready } = useUnlockedFlowers()
  const [active, setActive] = useState<Flower | null>(null)
  const [showGarden, setShowGarden] = useState(false)
  const [showFinal, setShowFinal] = useState(false)

  const hasFlowers = unlocked.length > 0

  function handleDiscover() {
    if (unlocked.length > 0) {
      // Abre a flor mais recente liberada
      setActive(unlocked[unlocked.length - 1])
    }
  }

  return (
    <main className="relative min-h-dvh overflow-hidden bg-background">
      {/* Glow ambiente de fundo */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-primary/15 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 rounded-full bg-primary/10 blur-[120px]" />

      <div className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col items-center safe-px safe-pt safe-pb">
        {/* Cabeçalho / Tela inicial */}
        <motion.header
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center pt-6 text-center"
        >
          <motion.div
            className="text-5xl"
            aria-hidden="true"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          >
            🌸
          </motion.div>
          <h1 className="mt-5 font-heading text-4xl font-semibold tracking-tight text-foreground text-glow">
            Flores do Tempo
          </h1>
          <p className="mt-3 text-pretty text-base leading-relaxed text-muted-foreground">
            Uma nova flor aparecerá a cada dia.
          </p>
        </motion.header>

        {/* Botão principal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-9 w-full"
        >
          <button
            type="button"
            onClick={handleDiscover}
            disabled={!ready || !hasFlowers}
            className="group relative flex w-full items-center justify-center overflow-hidden rounded-full border border-primary/40 bg-primary px-8 py-4 text-base font-medium text-primary-foreground transition-all duration-300 active:scale-[0.97] disabled:opacity-50"
          >
            <span
              className="pointer-events-none absolute inset-0 bg-primary/40 blur-xl"
              style={{ animation: "pulse-glow 4s ease-in-out infinite" }}
            />
            <span className="relative">
              {hasFlowers ? "Descobrir Flor" : "Em breve"}
            </span>
          </button>

          {ready && hasFlowers && (
            <button
              type="button"
              onClick={() => setShowGarden((v) => !v)}
              className="mx-auto mt-4 block text-sm text-muted-foreground underline-offset-4 transition-colors active:text-primary"
            >
              {showGarden ? "Ocultar jardim" : `Ver jardim (${unlocked.length})`}
            </button>
          )}
        </motion.div>

        {/* Jardim de flores liberadas */}
        <AnimatePresence>
          {showGarden && hasFlowers && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full overflow-hidden"
            >
              <div className="mt-7 grid grid-cols-2 gap-4">
                {unlocked.map((flower, index) => (
                  <FlowerCard
                    key={flower.id}
                    flower={flower}
                    index={index}
                    onSelect={setActive}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Linha do tempo */}
        <section className="mt-12 w-full">
          <h2 className="mb-4 text-center text-xs uppercase tracking-[0.22em] text-muted-foreground">
            Linha do tempo
          </h2>
          <DayTimeline timeline={timeline} onSelect={setActive} />
        </section>

        {/* Rodapé */}
        <footer className="fixed bottom-4 left-0 right-0 flex justify-center pointer-events-none">
        <p
            className="
            text-xs
            font-semibold
            bg-gradient-to-r
            from-zinc-200
            via-zinc-400
            to-red-500
            bg-clip-text
            text-transparent
            opacity-70
            tracking-wide
          "
        >
          Feito por: Alex
        </p>
      </footer>
      </div>

      {/* Experiência imersiva da flor */}
      <FlowerViewer
        flower={active}
        finalFlowerId={FINAL_FLOWER_ID}
        onClose={() => setActive(null)}
        onFinalReveal={() => {
          setActive(null)
          setShowFinal(true)
        }}
      />

      {/* Evento especial do dia 7 */}
      <FinalReveal open={showFinal} onClose={() => setShowFinal(false)} />
    </main>
  )
}
