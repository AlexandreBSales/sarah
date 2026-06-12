"use client"

import { useEffect, useRef, useState } from "react"

interface TypeWriterProps {
  text: string
  /** Atraso entre cada letra, em ms */
  speed?: number
  /** Atraso inicial antes de começar a digitar, em ms */
  startDelay?: number
  className?: string
  onDone?: () => void
}

export function TypeWriter({
  text,
  speed = 45,
  startDelay = 300,
  className,
  onDone,
}: TypeWriterProps) {
  const [count, setCount] = useState(0)
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone

  useEffect(() => {
    setCount(0)
    let index = 0
    let interval: ReturnType<typeof setInterval>

    const startTimeout = setTimeout(() => {
      interval = setInterval(() => {
        index += 1
        setCount(index)
        if (index >= text.length) {
          clearInterval(interval)
          onDoneRef.current?.()
        }
      }, speed)
    }, startDelay)

    return () => {
      clearTimeout(startTimeout)
      clearInterval(interval)
    }
  }, [text, speed, startDelay])

  const done = count >= text.length

  return (
    <p className={className} aria-label={text}>
      <span aria-hidden="true">{text.slice(0, count)}</span>
      {!done && (
        <span
          aria-hidden="true"
          className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[0.12em] bg-primary align-middle"
          style={{ animation: "pulse-glow 1s ease-in-out infinite" }}
        />
      )}
    </p>
  )
}
