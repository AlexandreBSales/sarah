/**
 * Retorna a data atual zerada (00:00:00) no fuso local,
 * para comparações de "dia" consistentes.
 */
export function getToday(): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

/**
 * Converte "YYYY-MM-DD" em um Date local zerado.
 */
export function parseUnlockDate(iso: string): Date {
  const [year, month, day] = iso.split("-").map(Number)
  return new Date(year, month - 1, day)
}

/**
 * Verifica se uma flor já foi liberada com base na data atual.
 */
export function isUnlocked(unlockDate: string): boolean {
  return getToday().getTime() >= parseUnlockDate(unlockDate).getTime()
}

/**
 * Formata uma data ISO para exibição amigável em pt-BR.
 */
export function formatDate(iso: string): string {
  return parseUnlockDate(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
  })
}
