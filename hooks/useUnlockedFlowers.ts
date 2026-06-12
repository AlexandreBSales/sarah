"use client"

import { useEffect, useState } from "react"
import { flowers } from "@/data/flowers"
import type { Flower } from "@/types/flower"
import { isUnlocked } from "@/utils/date"

interface UnlockedState {
  /** Flores já liberadas pela data atual */
  unlocked: Flower[]
  /** Todas as flores com flag de bloqueio (para a linha do tempo) */
  timeline: { flower: Flower; unlocked: boolean }[]
  /** Indica se o hook já calculou no cliente (evita mismatch de hidratação) */
  ready: boolean
}

/**
 * Calcula quais flores estão desbloqueadas com base na data atual do dispositivo.
 * Flores futuras permanecem bloqueadas; flores passadas continuam acessíveis.
 */
export function useUnlockedFlowers(): UnlockedState {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setReady(true)
  }, [])

  const timeline = flowers.map((flower) => ({
    flower,
    unlocked: ready ? isUnlocked(flower.unlockDate) : false,
  }))

  const unlocked = timeline.filter((t) => t.unlocked).map((t) => t.flower)

  return { unlocked, timeline, ready }
}
