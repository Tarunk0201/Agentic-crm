import { useEffect, useState } from 'react'

const useCountUp = (target = 0, duration = 900) => {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const start = performance.now()
    let raf = 0

    const update = (now) => {
      const progress = Math.min((now - start) / duration, 1)
      setCount(target * progress)
      if (progress < 1) raf = requestAnimationFrame(update)
    }

    raf = requestAnimationFrame(update)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])

  return count
}

export default useCountUp
