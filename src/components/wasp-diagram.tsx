"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"

export default function WaspDiagram() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <div ref={ref} className="w-full max-w-7xl mx-auto p-8 relative">
      {/* Golden glowing background for visibility */}
      <div className="absolute inset-0 rounded-lg overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-950/40 via-amber-900/30 to-yellow-950/40 backdrop-blur-sm" />
        <div className="absolute inset-0 overflow-hidden">
          <div 
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(45deg, transparent 30%, rgba(254, 204, 0, 0.15) 50%, transparent 70%)',
              animation: 'continuous-shine 3s linear infinite',
              transformOrigin: 'center center',
            }}
          />
        </div>
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'linear-gradient(rgba(254, 204, 0, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(254, 204, 0, 0.3) 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}
        />
      </div>

      {/* Diagram SVG */}
      <svg viewBox="0 0 1400 700" className="w-full h-auto relative z-10" xmlns="http://www.w3.org/2000/svg">
        {/* Title */}
        <motion.text
          x="700"
          y="40"
          textAnchor="middle"
          className="text-4xl font-bold fill-foreground"
          initial={{ opacity: 0, y: -20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          web app
        </motion.text>

        {/* Dashed border */}
        <motion.rect
          x="460"
          y="60"
          width="780"
          height="560"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="10,10"
          className="stroke-muted-foreground"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={isInView ? { pathLength: 1, opacity: 0.5 } : {}}
          transition={{ duration: 1.5, delay: 0.3 }}
        />

        {/* Left side - Input files */}
        <motion.g
          initial={{ opacity: 0, x: -50 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* .wasp file */}
          <g className="file-icon">
            <rect x="20" y="280" width="80" height="100" rx="4" fill="white" stroke="black" strokeWidth="2" />
            <path d="M 100 280 L 100 295 L 85 295 L 100 280" fill="#e5e5e5" stroke="black" strokeWidth="2" />
            <text x="35" y="310" className="text-sm font-mono fill-black">
              .wasp
            </text>
            <motion.image
              href="/icons/wasp-logo.svg"
              x="35"
              y="325"
              width="50"
              height="50"
              // animate={{ scale: [1, 1.1, 1] }}
              // transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </g>

          {/* .jsx file */}
          <g className="file-icon">
            <rect x="20" y="480" width="70" height="90" rx="4" fill="white" stroke="black" strokeWidth="2" />
            <path d="M 90 480 L 90 493 L 77 493 L 90 480" fill="#e5e5e5" stroke="black" strokeWidth="2" />
            <text x="30" y="505" className="text-sm font-mono fill-black">
              .jsx
            </text>
            <image href="/icons/react.svg" x="28" y="520" width="35" height="35" />
          </g>

          {/* .js file */}
          <g className="file-icon">
            <rect x="110" y="480" width="70" height="90" rx="4" fill="white" stroke="black" strokeWidth="2" />
            <path d="M 180 480 L 180 493 L 167 493 L 180 480" fill="#e5e5e5" stroke="black" strokeWidth="2" />
            <text x="125" y="505" className="text-sm font-mono fill-black">
              .js
            </text>
            <image href="/icons/es6.svg" x="127" y="520" width="35" height="35" />
          </g>
        </motion.g>

        {/* Arrows to compiler */}
        <motion.g
          initial={{ pathLength: 0, opacity: 0 }}
          animate={isInView ? { pathLength: 1, opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <motion.line x1="115" y1="330" x2="230" y2="330" stroke="grey" strokeWidth="4" className="arrow-line" />
          <circle cx="115" cy="330" r="5" fill="black" />
          <polygon points="215,325 230,330 215,335" fill="grey" />

          <motion.line x1="200" y1="475" x2="250" y2="415" stroke="grey" strokeWidth="4" className="arrow-line" />
          <circle cx="200" cy="475" r="5" fill="black" />
          <polygon points="237,421 250,415 245,432" fill="grey" />
        </motion.g>

        {/* Compiler - Center */}
        <motion.g
          initial={{ scale: 0, opacity: 0 }}
          animate={isInView ? { scale: 1, opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.7, type: "spring" }}
        >
          <motion.circle
            cx="315"
            cy="350"
            r="80"
            fill="#FCD34D"
            stroke="black"
            strokeWidth="3"
            animate={{
              boxShadow: ["0 0 0 0 rgba(252, 211, 77, 0.4)", "0 0 0 20px rgba(252, 211, 77, 0)"],
            }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.1))" }}
          />
          <motion.image
              href="/icons/wasp-logo.svg"
              x="240"
              y="275"
              width="150"
              height="150"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          <text x="305" y="480" textAnchor="middle" className="text-base font-semibold fill-white">
            wasp compiler
          </text>
        </motion.g>

        {/* Arrow to web app sections */}
        <motion.g
          initial={{ pathLength: 0, opacity: 0 }}
          animate={isInView ? { pathLength: 1, opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 1 }}
        >
          {/* Main horizontal line */}
          <line x1="395" y1="350" x2="460" y2="350" stroke="#FCD34D" strokeWidth="3" />

          {/* Front-end arrow */}
          <motion.path
            d="M 460 350 L 460 150 L 680 150"
            stroke="#FCD34D"
            strokeWidth="3"
            fill="none"
            className="flow-line"
          />
          <polygon points="680,145 695,150 680,155" fill="#FCD34D" />
          <text x="500" y="140" className="text-lg font-semibold fill-foreground">
            front-end
          </text>

          {/* Back-end arrow */}
          <motion.path d="M 460 350 L 680 350" stroke="#FCD34D" strokeWidth="3" fill="none" className="flow-line" />
          <polygon points="680,345 695,350 680,355" fill="#FCD34D" />
          <text x="520" y="340" className="text-lg font-semibold fill-foreground">
            back-end
          </text>

          {/* Deployment arrow */}
          <motion.path
            d="M 460 350 L 460 550 L 680 550"
            stroke="#FCD34D"
            strokeWidth="3"
            fill="none"
            className="flow-line"
          />
          <polygon points="680,545 695,550 680,555" fill="#FCD34D" />
          <text x="500" y="540" className="text-lg font-semibold fill-foreground">
            deployment
          </text>
        </motion.g>

        {/* Front-end section */}
        <motion.g
          initial={{ opacity: 0, x: 50 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, delay: 1.2 }}
        >
          {/* File icon - back layer */}
          <rect x="726" y="96" width="90" height="110" rx="4" fill="white" stroke="black" strokeWidth="2" opacity="0.6" />
          <path d="M 816 96 L 816 116 L 796 116 L 816 96" fill="#e5e5e5" stroke="black" strokeWidth="2" opacity="0.6" />
          
          {/* File icon - front layer */}
          <rect x="720" y="90" width="90" height="110" rx="4" fill="white" stroke="black" strokeWidth="2" />
          <path d="M 810 90 L 810 110 L 790 110 L 810 90" fill="#e5e5e5" stroke="black" strokeWidth="2" />
          <text x="745" y="150" className="text-3xl">
            ✏️
          </text>

          <motion.g
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity, delay: 0 }}
          >
            <image href="/icons/react.svg" x="845" y="95" width="70" height="70" />
          </motion.g>

          <motion.g
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity, delay: 0.3 }}
          >
            <image href="/icons/es6.svg" x="945" y="95" width="70" height="70" />
          </motion.g>

          <motion.g
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity, delay: 0.6 }}
          >
            <image href="/icons/tailwindcss.svg" x="1045" y="95" width="70" height="70" />
          </motion.g>
        </motion.g>

        {/* Back-end section */}
        <motion.g
          initial={{ opacity: 0, x: 50 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, delay: 1.4 }}
        >
          {/* File icon - back layer */}
          <rect x="726" y="296" width="90" height="110" rx="4" fill="white" stroke="black" strokeWidth="2" opacity="0.6" />
          <path d="M 816 296 L 816 316 L 796 316 L 816 296" fill="#e5e5e5" stroke="black" strokeWidth="2" opacity="0.6" />
          
          {/* File icon - front layer */}
          <rect x="720" y="290" width="90" height="110" rx="4" fill="white" stroke="black" strokeWidth="2" />
          <path d="M 810 290 L 810 310 L 790 310 L 810 290" fill="#e5e5e5" stroke="black" strokeWidth="2" />
          <g transform="translate(740, 320)">
            <rect width="50" height="40" fill="none" stroke="black" strokeWidth="2" />
            <line x1="10" y1="10" x2="40" y2="10" stroke="black" strokeWidth="2" />
            <line x1="10" y1="20" x2="40" y2="20" stroke="black" strokeWidth="2" />
            <line x1="10" y1="30" x2="40" y2="30" stroke="black" strokeWidth="2" />
          </g>

          <motion.g
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity, delay: 0.2 }}
          >
            <image href="/icons/nodejs.svg" x="850" y="310" width="80" height="80" />
          </motion.g>

          <motion.g
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
          >
            <image href="/icons/prisma.svg" x="945" y="310" width="70" height="70" />
          </motion.g>
        </motion.g>

        {/* Deployment section */}
        <motion.g
          initial={{ opacity: 0, x: 50 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, delay: 1.6 }}
        >
          {/* File icon - back layer */}
          <rect x="726" y="496" width="90" height="110" rx="4" fill="white" stroke="black" strokeWidth="2" opacity="0.6" />
          <path d="M 816 496 L 816 516 L 796 516 L 816 496" fill="#e5e5e5" stroke="black" strokeWidth="2" opacity="0.6" />
          
          {/* File icon - front layer */}
          <rect x="720" y="490" width="90" height="110" rx="4" fill="white" stroke="black" strokeWidth="2" />
          <path d="M 810 490 L 810 510 L 790 510 L 810 490" fill="#e5e5e5" stroke="black" strokeWidth="2" />
          <text x="745" y="550" className="text-3xl">
            🔧
          </text>

          <motion.g
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity, delay: 0.4 }}
          >
            <image href="/icons/docker.svg" x="850" y="510" width="70" height="70" />
          </motion.g>

          <motion.g
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity, delay: 0.7 }}
          >
            <image href="/icons/fly-io.svg" x="945" y="510" width="70" height="70" />
          </motion.g>
        </motion.g>

        {/* Bottom labels */}
        <motion.g
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 1.8 }}
        >
          <text x="150" y="660" className="text-lg fill-muted-foreground">
            written by developer
          </text>
          <text x="850" y="660" className="text-lg fill-muted-foreground">
            generated by Wasp
          </text>
        </motion.g>

        {/* Animated particles flowing through the system */}
        <motion.circle
          cx="0"
          cy="0"
          r="4"
          fill="#FCD34D"
          initial={{ opacity: 0 }}
          animate={
            isInView
              ? {
                  opacity: [0, 1, 1, 0],
                  offsetDistance: ["0%", "100%"],
                }
              : {}
          }
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatDelay: 1,
            delay: 2,
          }}
          style={{
            offsetPath: "path('M 115 330 L 315 330')",
          }}
        />
        <motion.circle
          cx="0"
          cy="0"
          r="4"
          fill="#FCD34D"
          initial={{ opacity: 0 }}
          animate={
            isInView
              ? {
                  opacity: [0, 1, 1, 0],
                  offsetDistance: ["0%", "100%"],
                }
              : {}
          }
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatDelay: 1,
            delay: 2,
          }}
          style={{
            offsetPath: "path('M 200 475 L 250 415')",
          }}
        />
      </svg>
    </div>
  )
}