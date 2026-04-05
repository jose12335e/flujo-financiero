import { useEffect, useState } from 'react'

interface ScrollVisibilityOptions {
  hideDistance?: number
  showDistance?: number
  topOffset?: number
}

export function useScrollVisibility({
  hideDistance = 52,
  showDistance = 68,
  topOffset = 72,
}: ScrollVisibilityOptions = {}) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    let lastScrollY = window.scrollY
    let lastDirection: 'down' | 'up' | null = null
    let accumulatedDelta = 0
    let frameId = 0

    const updateVisibility = () => {
      frameId = 0

      const currentScrollY = window.scrollY
      const delta = currentScrollY - lastScrollY

      if (Math.abs(delta) < 2) {
        lastScrollY = currentScrollY
        return
      }

      if (currentScrollY <= topOffset) {
        setIsVisible(true)
        accumulatedDelta = 0
        lastDirection = null
        lastScrollY = currentScrollY
        return
      }

      const direction = delta > 0 ? 'down' : 'up'

      if (direction !== lastDirection) {
        accumulatedDelta = 0
        lastDirection = direction
      }

      accumulatedDelta += Math.abs(delta)

      if (direction === 'down' && accumulatedDelta >= hideDistance) {
        setIsVisible(false)
        accumulatedDelta = 0
      }

      if (direction === 'up' && accumulatedDelta >= showDistance) {
        setIsVisible(true)
        accumulatedDelta = 0
      }

      lastScrollY = currentScrollY
    }

    const handleScroll = () => {
      if (frameId) {
        return
      }

      frameId = window.requestAnimationFrame(updateVisibility)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId)
      }

      window.removeEventListener('scroll', handleScroll)
    }
  }, [hideDistance, showDistance, topOffset])

  return isVisible
}
