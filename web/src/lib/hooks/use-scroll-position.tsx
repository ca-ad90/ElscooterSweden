import { useEffect, useState } from "react"
import { scrollObserver, type ScrollPosition } from "../observers/scrollObserver"

/**
 * Hook to track window scroll position
 * @returns Current scroll position { x, y }
 */
export function useScrollPosition(): ScrollPosition {
  const [scrollPosition, setScrollPosition] = useState<ScrollPosition>(() =>
    scrollObserver.getScrollPosition()
  )

  useEffect(() => {
    const unsubscribe = scrollObserver.subscribe((position) => {
      setScrollPosition(position)
    })

    return unsubscribe
  }, [])

  return scrollPosition
}
