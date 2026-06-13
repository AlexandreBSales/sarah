"use client"

import { AnimatePresence, motion } from "framer-motion"
import { useEffect, useState, useRef } from "react"
import { DayTimeline } from "@/components/DayTimeline"
import { FinalReveal } from "@/components/FinalReveal"
import { FlowerViewer } from "@/components/FlowerViewer"
import { flowers } from "@/data/flowers"
import { useUnlockedFlowers } from "@/hooks/useUnlockedFlowers"
import type { Flower } from "@/types/flower"

const FINAL_FLOWER_ID = flowers[flowers.length - 1].id
const API = "https://sarah-backend-teji.onrender.com"

// =========================
// ID DO VISITANTE
// =========================
function getVisitorId() {
  let id = localStorage.getItem("visitorId")

  if (!id) {
    id = Math.random().toString(36).substring(2, 10).toUpperCase()
    localStorage.setItem("visitorId", id)
  }

  return id
}

export default function Page() {
  const { unlocked, timeline } = useUnlockedFlowers()

  const [entered, setEntered] = useState(false)
  const [visitorId, setVisitorId] = useState("")
  const [active, setActive] = useState<Flower | null>(null)
  const [showFinal, setShowFinal] = useState(false)

  const sessionStart = useRef<number>(0)
  const sessionEnded = useRef(false)

  const hasFlowers = unlocked.length > 0

  // =========================
  // START SESSION
  // =========================
  async function handleEnter() {
    if (entered) return

    const id = getVisitorId()

    setVisitorId(id)
    setEntered(true)

    sessionStart.current = Date.now()
    sessionEnded.current = false

    try {
      await fetch(`${API}/session/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitorId: id,
          userAgent: navigator.userAgent,
          page: "flores-do-tempo",
          startedAt: sessionStart.current
        })
      })
    } catch (err) {
      console.error("session/start error:", err)
    }
  }

  // =========================
  // END SESSION (ROBUSTO)
  // =========================
  function endSession(reason: string) {
    if (!visitorId || sessionEnded.current) return

    sessionEnded.current = true

    const endedAt = Date.now()
    const duration = endedAt - sessionStart.current

    const payload = {
      visitorId,
      endedAt,
      duration,
      reason
    }

    fetch(`${API}/session/end`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true
    }).catch(() => {})
  }

  // =========================
  // TRACKING CONTÍNUO (PING)
  // =========================
  useEffect(() => {
    if (!entered || !visitorId) return

    const interval = setInterval(() => {
      fetch(`${API}/session/ping`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitorId })
      }).catch(() => {})
    }, 15000)

    return () => clearInterval(interval)
  }, [entered, visitorId])

  // =========================
  // DETECÇÃO DE SAÍDA REAL
  // =========================
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "hidden") {
        endSession("visibility_hidden")
      }
    }

    const handlePageHide = () => {
      endSession("pagehide")
    }

    const handleBlur = () => {
      endSession("blur")
    }

    document.addEventListener("visibilitychange", handleVisibility)
    window.addEventListener("pagehide", handlePageHide)
    window.addEventListener("blur", handleBlur)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility)
      window.removeEventListener("pagehide", handlePageHide)
      window.removeEventListener("blur", handleBlur)
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
            className="mt-6 rounded-full bg-black px-10 py-3 border border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:bg-purple-600"
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

        <header className="flex flex-col items-center pt-6 text-center">
          <div className="text-5xl">🌸</div>
          <h1 className="mt-5 text-4xl font-semibold">Flores do Tempo</h1>
          <p className="mt-3 text-muted-foreground">
            Uma nova flor aparecerá a cada dia.
          </p>
        </header>

        <div className="mt-9 w-full">
          <button
            onClick={handleDiscover}
            className="w-full rounded-full bg-primary px-8 py-4 text-white"
          >
            {hasFlowers ? "Descobrir Flor" : "Em breve"}
          </button>
        </div>

        <section className="mt-12 w-full">
          <DayTimeline timeline={timeline} onSelect={setActive} />
        </section>

      </div>

      <FlowerViewer
        flower={active}
        finalFlowerId={FINAL_FLOWER_ID}
        onClose={() => setActive(null)}
        onFinalReveal={() => setShowFinal(true)}
      />

      <FinalReveal open={showFinal} onClose={() => setShowFinal(false)} />
    </main>
  )
}
