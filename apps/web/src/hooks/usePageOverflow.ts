import { useEffect, useRef, useState } from 'react'

const A4_HEIGHT_PX = 1123

export function usePageOverflow() {
  const ref = useRef<HTMLDivElement>(null)
  const [isOverflowing, setIsOverflowing] = useState(false)
  const [overflowAmount, setOverflowAmount] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new ResizeObserver(() => {
      const height = el.scrollHeight
      const overflow = height - A4_HEIGHT_PX
      setIsOverflowing(overflow > 0)
      setOverflowAmount(Math.max(0, overflow))
    })

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return { ref, isOverflowing, overflowAmount }
}
