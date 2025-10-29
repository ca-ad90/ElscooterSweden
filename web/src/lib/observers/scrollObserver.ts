type ScrollPosition = {
  x: number
  y: number
}

type ScrollCallback = (position: ScrollPosition) => void

class ScrollObserver {
  private subscribers: Set<ScrollCallback> = new Set()
  private scrollPosition: ScrollPosition = { x: 0, y: 0 }
  private isListening = false
  private rafId: number | null = null

  private handleScroll = (): void => {
    // Cancel any pending animation frame
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId)
    }

    // Use requestAnimationFrame to batch updates with browser repaints
    // This throttles callbacks to ~60fps instead of firing on every scroll event
    this.rafId = requestAnimationFrame(() => {
      this.scrollPosition = {
        x: window.scrollX || window.pageXOffset,
        y: window.scrollY || window.pageYOffset,
      }

      // Notify all subscribers
      this.subscribers.forEach((callback) => {
        callback(this.scrollPosition)
      })

      this.rafId = null
    })
  }

  private startListening(): void {
    if (this.isListening || typeof window === "undefined") {
      return
    }

    window.addEventListener("scroll", this.handleScroll, { passive: true })
    this.isListening = true
  }

  private stopListening(): void {
    if (!this.isListening || typeof window === "undefined") {
      return
    }

    // Cancel any pending animation frame
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }

    window.removeEventListener("scroll", this.handleScroll)
    this.isListening = false
  }

  /**
   * Subscribe to scroll position changes
   * @param callback Function to call when scroll position changes
   * @returns Unsubscribe function
   */
  subscribe(callback: ScrollCallback): () => void {
    this.subscribers.add(callback)

    // Start listening if this is the first subscriber
    if (this.subscribers.size === 1) {
      this.startListening()
    }

    // Immediately call with current position
    callback(this.scrollPosition)

    // Return unsubscribe function
    return () => {
      this.unsubscribe(callback)
    }
  }

  /**
   * Unsubscribe from scroll position changes
   * @param callback The callback function to remove
   */
  unsubscribe(callback: ScrollCallback): void {
    this.subscribers.delete(callback)

    // Stop listening if there are no more subscribers
    if (this.subscribers.size === 0) {
      this.stopListening()
    }
  }

  /**
   * Get the current scroll position
   */
  getScrollPosition(): ScrollPosition {
    if (typeof window !== "undefined" && !this.isListening) {
      return {
        x: window.scrollX || window.pageXOffset,
        y: window.scrollY || window.pageYOffset,
      }
    }
    return this.scrollPosition
  }

  /**
   * Destroy the observer and clean up all listeners
   */
  destroy(): void {
    this.subscribers.clear()
    this.stopListening()

    // Final cleanup for pending RAF
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
  }
}

// Export singleton instance
export const scrollObserver = new ScrollObserver()

// Export types
export type { ScrollPosition, ScrollCallback }
