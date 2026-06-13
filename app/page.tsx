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
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-gradient-to-b from-black via-zinc-950 to-purple-950 text-white">

      {/* Glow principal */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{
          duration: 8,
          repeat: Infinity
        }}
        className="pointer-events-none absolute h-[500px] w-[500px] rounded-full bg-purple-500/20 blur-[150px]"
      />

      {/* Glow secundário */}
      <motion.div
        animate={{
          y: [0, -30, 0]
        }}
        transition={{
          duration: 10,
          repeat: Infinity
        }}
        className="pointer-events-none absolute bottom-0 right-0 h-[350px] w-[350px] rounded-full bg-fuchsia-500/10 blur-[120px]"
      />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="
          relative
          w-[90%]
          max-w-md
          rounded-[32px]
          border
          border-purple-500/20
          bg-white/5
          p-8
          backdrop-blur-xl
          shadow-[0_0_50px_rgba(168,85,247,0.15)]
        "
      >
        <motion.div
          animate={{
            y: [0, -10, 0],
            rotate: [0, 3, -3, 0]
          }}
          transition={{
            duration: 6,
            repeat: Infinity
          }}
          className="text-center text-7xl"
        >
          🌸
        </motion.div>

        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="
            mt-4
            text-center
            text-5xl
            font-bold
            bg-gradient-to-r
            from-purple-300
            via-fuchsia-400
            to-purple-500
            bg-clip-text
            text-transparent
          "
        >
          Flores do Tempo
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-4 text-center text-zinc-300"
        >
          Uma experiência única te espera.
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-2 text-center text-sm text-zinc-500"
        >
          Cada dia revela uma nova flor, um novo significado e uma nova lembrança.
        </motion.p>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleEnter}
          className="
            mt-8
            w-full
            rounded-2xl
            bg-gradient-to-r
            from-purple-600
            to-fuchsia-600
            px-8
            py-4
            text-lg
            font-semibold
            shadow-[0_0_30px_rgba(168,85,247,0.45)]
            transition-all
          "
        >
          ✨ Entrar
        </motion.button>
      </motion.div>

      {/* Rodapé */}
      <footer className="absolute bottom-5 text-center">
        <p className="text-xs text-zinc-500">
          Feito por{" "}
          <span className="font-medium text-purple-400">
            Alex
          </span>
        </p>
      </footer>
    </main>
  )
}

// =========================
// MAIN
// =========================
return (
  <main className="relative min-h-dvh overflow-hidden bg-background">

    <div className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-primary/15 blur-[120px]" />

    <div className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col items-center safe-px safe-pt safe-pb">

      <header className="flex flex-col items-center pt-6 text-center">
        <motion.div
          animate={{
            y: [0, -5, 0]
          }}
          transition={{
            repeat: Infinity,
            duration: 4
          }}
          className="text-5xl"
        >
          🌸
        </motion.div>

        <h1 className="mt-5 text-4xl font-semibold">
          Flores do Tempo
        </h1>

        <p className="mt-2 text-purple-300 text-sm">
          Olá, {displayName}
        </p>

        <p className="mt-2 text-muted-foreground">
          Uma nova flor aparecerá a cada dia.
        </p>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-9 w-full"
      >
        <button
          onClick={handleDiscover}
          className="
            w-full
            rounded-full
            bg-gradient-to-r
            from-purple-600
            to-fuchsia-600
            px-8
            py-4
            text-white
            font-medium
            transition-all
            hover:scale-[1.02]
          "
        >
          {hasFlowers ? "🌺 Descobrir Flor" : "⏳ Em breve"}
        </button>
      </motion.div>

      <section className="mt-12 w-full">
        <DayTimeline
          timeline={timeline}
          onSelect={setActive}
        />
      </section>

      <footer className="mt-auto py-6 text-center">
        <p className="text-xs text-zinc-500">
          Feito por{" "}
          <span className="font-medium text-purple-400">
            Alex
          </span>
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
