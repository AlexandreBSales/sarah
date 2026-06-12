"use client"

import { AnimatePresence, motion } from "framer-motion"
import { useEffect, useState } from "react"
import { DayTimeline } from "@/components/DayTimeline"
import { FinalReveal } from "@/components/FinalReveal"
import { FlowerCard } from "@/components/FlowerCard"
import { FlowerViewer } from "@/components/FlowerViewer"
import { flowers } from "@/data/flowers"
import { useUnlockedFlowers } from "@/hooks/useUnlockedFlowers"
import type { Flower } from "@/types/flower"

const FINAL_FLOWER_ID = flowers[flowers.length - 1].id

const API = "https://sarah-backend-teji.onrender.com"

function getVisitorId() {
  let id = localStorage.getItem("visitorId")

  if (!id) {
    id = Math.random().toString(36).substring(2, 10).toUpperCase()
    localStorage.setItem("visitorId", id)
  }

  return id
}

export default function Page() {
  const { unlocked, timeline, ready } = useUnlockedFlowers()
  const [active, setActive] = useState<Flower | null>(null)
  const [showGarden, setShowGarden] = useState(false)
  const [showFinal, setShowFinal] = useState(false)

  const hasFlowers = unlocked.length > 0

  const [visitorId, setVisitorId] = useState("")

  // =========================
  // TRACKING INICIAL (1x)
  // =========================
  useEffect(() => {
    const id = getVisitorId()
    setVisitorId(id)

    fetch(`${API}/session/start`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        visitorId: id,
        name: "Visitante",
        userAgent: navigator.userAgent,
        startedAt: Date.now(),
        page: "flores-do-tempo"
      })
    }).catch(console.error)
  }, [])

  function handleDiscover() {
    if (unlocked.length > 0) {
      setActive(unlocked[unlocked.length - 1])
    }
  }

  return (
    <main className="relative min-h-dvh overflow-hidden bg-background">

      {/* Glow fundo */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-primary/15 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 rounded-full bg-primary/10 blur-[120px]" />

      <div className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col items-center safe-px safe-pt safe-pb">

        {/* HEADER */}
        <motion.header
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center pt-6 text-center"
        >
          <motion.div
            className="text-5xl"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 5, repeat: Infinity }}
          >
            🌸
          </motion.div>

          <h1 className="mt-5 text-4xl font-semibold text-foreground">
            Flores do Tempo
          </h1>

          <p className="mt-3 text-muted-foreground">
            Uma nova flor aparecerá a cada dia.
          </p>
        </motion.header>

        {/* BOTÃO PRINCIPAL */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-9 w-full"
        >
          <button
            onClick={handleDiscover}
            disabled={!ready}
            className="relative w-full rounded-full bg-primary px-8 py-4 text-primary-foreground transition active:scale-95 disabled:opacity-50"
          >
            {hasFlowers ? "Descobrir Flor" : "Em breve"}
          </button>

          {hasFlowers && (
            <button
              onClick={() => setShowGarden(v => !v)}
              className="mt-4 text-sm text-muted-foreground underline"
            >
              {showGarden ? "Ocultar jardim" : `Ver jardim (${unlocked.length})`}
            </button>
          )}
        </motion.div>

        {/* JARDIM */}
        <AnimatePresence>
          {showGarden && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
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

        {/* TIMELINE */}
        <section className="mt-12 w-full">
          <h2 className="mb-4 text-center text-xs uppercase text-muted-foreground">
            Linha do tempo
          </h2>
          <DayTimeline timeline={timeline} onSelect={setActive} />
        </section>

        {/* FOOTER */}
        <footer className="fixed bottom-4 left-0 right-0 flex justify-center">
          <p className="text-xs text-muted-foreground">
            Feito por: Alex
          </p>
        </footer>

      </div>

      {/* VIEWER */}
      <FlowerViewer
        flower={active}
        finalFlowerId={FINAL_FLOWER_ID}
        onClose={() => setActive(null)}
        onFinalReveal={() => {
          setActive(null)
          setShowFinal(true)
        }}
      />

      {/* FINAL EVENT */}
      <FinalReveal open={showFinal} onClose={() => setShowFinal(false)} />

    </main>
  )
}
