import { useEffect, useRef, useState } from 'react'

/**
 * Animates a number counting up from 0 to `value` once it scrolls into view.
 * Uses IntersectionObserver so it only starts when the user actually sees it —
 * not on mount, which would finish before a late-scrolling user gets there.
 */
export default function CountUp({ value, duration = 1200, className = '', suffix = '', decimals = 0 }) {
  const ref = useRef(null)
  const [display, setDisplay] = useState(0)
  const hasAnimated = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const numericValue = Number(value) || 0

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated.current) {
            hasAnimated.current = true
            const start = performance.now()

            const tick = (now) => {
              const elapsed = now - start
              const progress = Math.min(elapsed / duration, 1)
              // ease-out cubic — fast start, gentle settle
              const eased = 1 - Math.pow(1 - progress, 3)
              setDisplay(numericValue * eased)
              if (progress < 1) requestAnimationFrame(tick)
              else setDisplay(numericValue)
            }
            requestAnimationFrame(tick)
            observer.disconnect()
          }
        })
      },
      { threshold: 0.3 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [value, duration])

  return (
    <span ref={ref} className={className}>
      {display.toFixed(decimals)}{suffix}
    </span>
  )
}