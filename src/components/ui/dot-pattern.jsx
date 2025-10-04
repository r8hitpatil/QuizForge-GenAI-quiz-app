import React, { useEffect, useId, useRef, useState } from "react"
import { motion } from "motion/react"

import { cn } from "@/lib/utils"

export function DotPattern({
  width = 16,
  height = 16,
  x = 0,
  y = 0,
  cx = 1,
  cy = 1,
  cr = 1,
  className,
  glow = false,
  ...props
}) {
  const id = useId()
  const containerRef = useRef(null)
  const [dimensions, setDimensions] = useState({ 
    width: 0, 
    height: 0 
  })
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    // Mark as client-side
    setIsClient(true)
    
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        const parentRect = containerRef.current.parentElement?.getBoundingClientRect()
        
        setDimensions({ 
          width: Math.max(rect.width, parentRect?.width || 0, window.innerWidth), 
          height: Math.max(rect.height, parentRect?.height || 0, window.innerHeight)
        })
      } else {
        // Fallback dimensions
        setDimensions({ 
          width: window.innerWidth, 
          height: window.innerHeight 
        })
      }
    }

    // Initial update
    updateDimensions()
    
    // Add resize listener
    window.addEventListener("resize", updateDimensions)
    
    // Cleanup
    return () => {
      window.removeEventListener("resize", updateDimensions)
    }
  }, [])

  // Don't render dots until we have proper dimensions
  if (!isClient || dimensions.width === 0 || dimensions.height === 0) {
    return (
      <svg
        ref={containerRef}
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 h-full w-full text-neutral-400/80",
          className
        )}
        {...props}
      />
    )
  }

  const dots = Array.from({
    length: Math.ceil(dimensions.width / width) * Math.ceil(dimensions.height / height),
  }, (_, i) => {
    const colCount = Math.ceil(dimensions.width / width)
    const col = i % colCount
    const row = Math.floor(i / colCount)
    return {
      x: col * width + cx,
      y: row * height + cy,
      delay: Math.random() * 5,
      duration: Math.random() * 3 + 2,
    };
  })

  return (
    <svg
      ref={containerRef}
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full text-neutral-400/80",
        className
      )}
      viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
      preserveAspectRatio="xMidYMid slice"
      {...props}
    >
      <defs>
        <radialGradient id={`${id}-gradient`}>
          <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
      </defs>
      {dots.map((dot, index) => (
        <motion.circle
          key={`${dot.x}-${dot.y}-${index}`}
          cx={dot.x}
          cy={dot.y}
          r={cr}
          fill={glow ? `url(#${id}-gradient)` : "currentColor"}
          initial={glow ? { opacity: 0.4, scale: 1 } : {}}
          animate={
            glow
              ? {
                  opacity: [0.4, 1, 0.4],
                  scale: [1, 1.5, 1],
                }
              : {}
          }
          transition={
            glow
              ? {
                  duration: dot.duration,
                  repeat: Infinity,
                  repeatType: "reverse",
                  delay: dot.delay,
                  ease: "easeInOut",
                }
              : {}
          }
        />
      ))}
    </svg>
  );
}
