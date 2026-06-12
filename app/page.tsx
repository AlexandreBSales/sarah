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

  const [entered, setEntered] = useState(false)
  const [visitorId, setVisitorId] = useState("")
  const [active, setActive] = useState<Flower | null>(null)
  const [showGarden, setShowGarden] = useState(false)
  const [showFinal, setShowFinal] = useState(false)

  const hasFlowers = unlocked.length > 0

  // =========================
  // ENTRAR NO SISTEMA
  // =========================
  async function handleEnter() {
    const id = getVisitorId()

    setVisitorId(id)
    setEntered(true)

    try {
      await fetch(`${API}/session/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitorId: id,
          name: "Visitante",
          userAgent: navigator.userAgent,
          startedAt: Date.now(),
          page: "flores-do-tempo"
        })
      })
    } catch (err) {
      console.error("Erro session/start:", err)
    }
  }

  // =========================
  // PING (STATUS ONLINE)
  // =========================
  useEffect(() => {
    if (!entered || !visitorId) return

    const interval = setInterval(() => {
      fetch(`${API}/session/ping`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitorId })
      }).catch(() => {})
    }, 5000)

    return () => clearInterval(interval)
  }, [entered, visitorId])

  // =========================
  // SAÍDA DA PÁGINA (END SESSION)
  // =========================
  useEffect(() => {
    const handleExit = () => {
      if (!visitorId) return

      navigator.sendBeacon(
        `${API}/session/end`,
        JSON.stringify({
          visitorId,
          endedAt: Date.now()
        })
      )
    }

    window.addEventListener("beforeunload", handleExit)

    return () => {
      window.removeEventListener("beforeunload", handleExit)
    }
  }, [visitorId])

  // =========================
  function handleDiscover() {
    if (unlocked.length > 0) {
      setActive(unlocked[unlocked.length - 1])
    }
  }

  // =========================
  // TELA DE ENTRADA
  // =========================
  if (!entered) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-black text-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <h1 className="text-3xl font-semibold text-purple-400">
            Flores do Tempo
          </h1>

          <p className="mt-2 text-sm text-zinc-400">
            Uma experiência única te espera
          </p>

          <button
            onClick={handleEnter}
            className="mt-6 rounded-full bg-black px-10 py-3 text-white border border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.4)] transition hover:bg-purple-600"
          >
            Entrar
          </button>
        </motion.div>
      </main>
    )
  }

  // =========================
  // SITE PRINCIPAL
  // =========================
  return (
    <main className="relative min-h-dvh overflow-hidden bg-background">

      <div className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-primary/15 blur-[120px]" />

      <div className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col items-center safe-px safe-pt safe-pb">

        {/* HEADER */}
        <header className="flex flex-col items-center pt-6 text-center">
          <div className="text-5xl">🌸</div>

          <h1 className="mt-5 text-4xl font-semibold">
            Flores do Tempo
          </h1>

          <p className="mt-3 text-muted-foreground">
            Uma nova flor aparecerá a cada dia.
          </p>
        </header>

        {/* BOTÃO */}
        <div className="mt-9 w-full">
          <button
            onClick={handleDiscover}
            className="w-full rounded-full bg-primary px-8 py-4 text-white"
          >
            {hasFlowers ? "Descobrir Flor" : "Em breve"}
          </button>
        </div>

        {/* JARDIM */}
        <AnimatePresence>
          {showGarden && (
            <motion.div className="w-full mt-6">
              <div className="grid grid-cols-2 gap-4">
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
          <h2 className="text-center text-xs text-muted-foreground">
            Linha do tempo
          </h2>
          <DayTimeline timeline={timeline} onSelect={setActive} />
        </section>

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

      <FinalReveal open={showFinal} onClose={() => setShowFinal(false)} />
    </main>
  )
}
