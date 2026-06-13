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
// VISITOR ID
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
  const [displayName, setDisplayName] = useState("Visitante")

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
          displayName, // 👈 AGORA TEM NOME EDITÁVEL PELO BOT
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
  // END SESSION (COM SEGUNDOS REAL)
  // =========================
  function endSession(reason: string) {
    if (!visitorId || sessionEnded.current) return

    sessionEnded.current = true

    const endedAt = Date.now()
    const durationMs = endedAt - sessionStart.current
    const durationSeconds = Math.floor(durationMs / 1000)

    const payload = {
      visitorId,
      displayName,
      startedAt: sessionStart.current,
      endedAt,
      durationMs,
      durationSeconds,
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
  // PING (ONLINE STATUS)
  // =========================
  useEffect(() => {
    if (!entered || !visitorId) return

    const interval = setInterval(() => {
      fetch(`${API}/session/ping`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitorId,
          lastSeen: Date.now()
        })
      }).catch(() => {})
    }, 15000)

    return () => clearInterval(interval)
  }, [entered, visitorId])

  // =========================
  // DETECÇÃO DE SAÍDA
  // =========================
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "hidden") {
        endSession("tab_hidden")
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
  // ENTRY SCREEN
  // =========================
  if (!entered) {
return (
  <main className="relative min-h-dvh overflow-hidden bg-gradient-to-b from-black via-zinc-950 to-purple-950 text-white">

    {/* Glow Superior */}
    <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-purple-500/20 blur-[150px]" />

    {/* Glow Inferior */}
    <div className="pointer-events-none absolute bottom-0 left-1/2 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-fuchsia-500/10 blur-[140px]" />

    <div className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col items-center px-5 py-6">

      {/* HEADER */}
      <motion.header
        initial={{ opacity: 0, y: -25 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center text-center"
      >
        <motion.div
          animate={{
            y: [0, -8, 0]
          }}
          transition={{
            repeat: Infinity,
            duration: 4
          }}
          className="text-7xl"
        >
          🌸
        </motion.div>

        <h1 className="mt-4 text-5xl font-bold bg-gradient-to-r from-purple-300 via-fuchsia-400 to-purple-500 bg-clip-text text-transparent">
          Flores do Tempo
        </h1>

        <p className="mt-3 text-purple-200">
          Bem-vinda, <span className="font-semibold">{displayName}</span>
        </p>

        <p className="mt-2 max-w-xs text-sm text-zinc-400">
          Cada dia revela uma nova flor, um novo significado e uma nova lembrança.
        </p>
      </motion.header>

      {/* CARD PRINCIPAL */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-10 w-full rounded-3xl border border-purple-500/20 bg-white/5 backdrop-blur-xl p-5 shadow-[0_0_40px_rgba(168,85,247,0.15)]"
      >
        <button
          onClick={handleDiscover}
          className="
            w-full
            rounded-2xl
            bg-gradient-to-r
            from-purple-600
            to-fuchsia-600
            px-8
            py-4
            text-lg
            font-semibold
            transition-all
            hover:scale-[1.02]
            hover:shadow-[0_0_25px_rgba(168,85,247,0.6)]
          "
        >
          {hasFlowers ? "🌺 Descobrir Flor" : "⏳ Em breve"}
        </button>

        <div className="mt-8 rounded-2xl border border-white/10 bg-black/20 p-4">
          <h2 className="mb-4 text-center text-sm uppercase tracking-widest text-purple-300">
            Linha do Tempo
          </h2>

          <DayTimeline
            timeline={timeline}
            onSelect={setActive}
          />
        </div>
      </motion.div>

      {/* RODAPÉ */}
      <footer className="mt-auto pt-10 pb-4 text-center">
        <p className="text-xs text-zinc-500">
          Feito por <span className="text-purple-400 font-medium">Alex</span>
        </p>
      </footer>
    </div>

    <FlowerViewer
      flower={active}
      finalFlowerId={FINAL_FLOWER_ID}
      onClose={() => setActive(null)}
      onFinalReveal={() => setShowFinal(true)}
    />

    <FinalReveal
      open={showFinal}
      onClose={() => setShowFinal(false)}
    />
  </main>
)
}
