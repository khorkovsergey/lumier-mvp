'use client'

import { useEffect, useRef } from 'react'

interface LifeLine {
  id: number
  x: number; y: number
  angle: number
  speed: number
  wobbleOffset: number
  wobbleSpeed: number
  wobbleAmp: number
  life: number
  maxLife: number
  trail: { x: number; y: number }[]
  baseOpacity: number
  thickness: number
  isMajor: boolean   // major lines: thicker, brighter, slower
}

interface Spark {
  x: number; y: number
  vx: number; vy: number
  life: number; maxLife: number
  size: number
}

interface LifeEvent {
  x: number; y: number
  life: number; maxLife: number
  radius: number
  rings: number   // 1 = small event, 2-3 = significant crossing
}

let _id = 0

function spawnLine(W: number, H: number): LifeLine {
  const edge = Math.floor(Math.random() * 4)
  let x = 0, y = 0, angle = 0

  if (edge === 0) {
    x = Math.random() * W; y = -6
    angle = Math.PI * 0.12 + Math.random() * Math.PI * 0.76
  } else if (edge === 1) {
    x = W + 6; y = Math.random() * H
    angle = Math.PI * 0.62 + Math.random() * Math.PI * 0.76
  } else if (edge === 2) {
    x = Math.random() * W; y = H + 6
    angle = Math.PI * 1.12 + Math.random() * Math.PI * 0.76
  } else {
    x = -6; y = Math.random() * H
    angle = -Math.PI * 0.38 + Math.random() * Math.PI * 0.76
  }

  const isMajor = Math.random() < 0.28

  return {
    id: _id++, x, y, angle,
    speed:        isMajor ? 0.45 + Math.random() * 0.35 : 0.9 + Math.random() * 1.1,
    wobbleOffset: Math.random() * Math.PI * 2,
    wobbleSpeed:  0.018 + Math.random() * 0.025,
    wobbleAmp:    isMajor ? 0.5 + Math.random() * 0.8 : 0.25 + Math.random() * 0.5,
    life: 0,
    maxLife: isMajor ? 1400 + Math.random() * 800 : 600 + Math.random() * 500,
    trail: [],
    baseOpacity:  isMajor ? 0.55 + Math.random() * 0.2 : 0.3 + Math.random() * 0.2,
    thickness:    isMajor ? 1.2 + Math.random() * 0.8 : 0.5 + Math.random() * 0.5,
    isMajor,
  }
}

function segmentIntersect(
  ax: number, ay: number, bx: number, by: number,
  cx: number, cy: number, dx: number, dy: number,
): { x: number; y: number } | null {
  const dxAB = bx - ax, dyAB = by - ay
  const dxCD = dx - cx, dyCD = dy - cy
  const den  = dxAB * dyCD - dyAB * dxCD
  if (Math.abs(den) < 1e-6) return null
  const t = ((cx - ax) * dyCD - (cy - ay) * dxCD) / den
  const u = ((cx - ax) * dyAB - (cy - ay) * dxAB) / den
  if (t < 0 || t > 1 || u < 0 || u > 1) return null
  return { x: ax + t * dxAB, y: ay + t * dyAB }
}

// Draw smooth bezier curve through a polyline
function drawSmoothLine(
  ctx: CanvasRenderingContext2D,
  pts: { x: number; y: number }[],
  opacityFn: (t: number) => number,
  thickness: number,
  isMajor: boolean,
) {
  if (pts.length < 3) return
  const N = pts.length

  // Draw in segments so we can vary opacity along the trail
  const STEP = isMajor ? 3 : 4
  for (let i = STEP; i < N; i += STEP) {
    const t0 = (i - STEP) / N
    const t1 = i / N
    const alpha = opacityFn((t0 + t1) / 2)
    if (alpha < 0.005) continue

    ctx.beginPath()
    ctx.moveTo(pts[i - STEP].x, pts[i - STEP].y)

    // Smooth through midpoints
    for (let k = i - STEP + 1; k <= i && k < N; k++) {
      const prev = pts[k - 1]
      const curr = pts[k]
      const mx = (prev.x + curr.x) / 2
      const my = (prev.y + curr.y) / 2
      ctx.quadraticCurveTo(prev.x, prev.y, mx, my)
    }

    ctx.strokeStyle = `rgba(196,150,74,${alpha.toFixed(3)})`
    ctx.lineWidth   = thickness * (0.4 + t1 * 0.8)   // taper from tail to head
    ctx.lineCap     = 'round'
    ctx.lineJoin    = 'round'
    ctx.stroke()
  }
}

function run(cv: HTMLCanvasElement, ctx: CanvasRenderingContext2D): () => void {
  let W = 0, H = 0
  let raf: number
  let frame = 0

  let lines:  LifeLine[]  = []
  let events: LifeEvent[] = []
  let sparks: Spark[]     = []

  function resize() {
    W = window.innerWidth;  cv.width  = W
    H = window.innerHeight; cv.height = H
  }
  resize()
  window.addEventListener('resize', resize)

  // Pre-populate so screen isn't empty on first render
  for (let i = 0; i < 18; i++) {
    const l = spawnLine(W, H)
    // Scatter lines at random stages of their life
    const skip = Math.floor(Math.random() * l.maxLife * 0.55)
    for (let j = 0; j < skip; j++) {
      const wobble = Math.sin(l.wobbleOffset + j * l.wobbleSpeed) * l.wobbleAmp
      l.x += Math.cos(l.angle) * l.speed + Math.cos(l.angle + Math.PI / 2) * wobble * 0.05
      l.y += Math.sin(l.angle) * l.speed + Math.sin(l.angle + Math.PI / 2) * wobble * 0.05
      if (l.trail.length < 150) l.trail.push({ x: l.x, y: l.y })
    }
    l.life = skip
    lines.push(l)
  }

  const TRAIL_MAX = 150
  const OFFSCREEN = 180

  function tick() {
    frame++
    ctx.clearRect(0, 0, W, H)

    // ── Spawn ────────────────────────────────────────────────────────
    if (lines.length < 22 && frame % 55 === 0) {
      lines.push(spawnLine(W, H))
    }

    // ── Update & draw lines ──────────────────────────────────────────
    const dead: number[] = []

    for (const ln of lines) {
      ln.life++
      const wobble = Math.sin(ln.wobbleOffset + ln.life * ln.wobbleSpeed) * ln.wobbleAmp
      ln.x += Math.cos(ln.angle) * ln.speed + Math.cos(ln.angle + Math.PI / 2) * wobble * 0.06
      ln.y += Math.sin(ln.angle) * ln.speed + Math.sin(ln.angle + Math.PI / 2) * wobble * 0.06

      ln.trail.push({ x: ln.x, y: ln.y })
      if (ln.trail.length > TRAIL_MAX) ln.trail.shift()

      if (
        ln.life > ln.maxLife ||
        (ln.x < -OFFSCREEN || ln.x > W + OFFSCREEN ||
         ln.y < -OFFSCREEN || ln.y > H + OFFSCREEN)
      ) { dead.push(ln.id); continue }

      if (ln.trail.length < 4) continue

      const prog = ln.life / ln.maxLife
      const lifeFade =
        prog < 0.08 ? prog / 0.08 :
        prog > 0.82 ? (1 - prog) / 0.18 : 1

      drawSmoothLine(
        ctx, ln.trail,
        (t) => t * t * ln.baseOpacity * lifeFade,
        ln.thickness,
        ln.isMajor,
      )

      // Head glow
      const ha = ln.baseOpacity * lifeFade * (ln.isMajor ? 2.2 : 1.6)
      if (ln.isMajor) {
        // Soft halo around major line head
        const g = ctx.createRadialGradient(ln.x, ln.y, 0, ln.x, ln.y, ln.thickness * 5)
        g.addColorStop(0, `rgba(196,150,74,${Math.min(ha * 0.6, 0.5).toFixed(3)})`)
        g.addColorStop(1, 'rgba(196,150,74,0)')
        ctx.beginPath()
        ctx.arc(ln.x, ln.y, ln.thickness * 5, 0, Math.PI * 2)
        ctx.fillStyle = g
        ctx.fill()
      }
      ctx.beginPath()
      ctx.arc(ln.x, ln.y, ln.thickness * 1.4, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(196,150,74,${Math.min(ha, 0.7).toFixed(3)})`
      ctx.fill()
    }
    lines = lines.filter(l => !dead.includes(l.id))

    // ── Intersection detection (every 2 frames) ──────────────────────
    if (frame % 2 === 0 && events.length < 24) {
      const TAIL = 12
      for (let i = 0; i < lines.length; i++) {
        for (let j = i + 1; j < lines.length; j++) {
          const ta = lines[i].trail
          const tb = lines[j].trail
          if (ta.length < 2 || tb.length < 2) continue

          const segA = ta.slice(-TAIL)
          const segB = tb.slice(-TAIL)
          let found = false

          outer:
          for (let ai = 1; ai < segA.length; ai++) {
            for (let bi = 1; bi < segB.length; bi++) {
              const pt = segmentIntersect(
                segA[ai-1].x, segA[ai-1].y, segA[ai].x, segA[ai].y,
                segB[bi-1].x, segB[bi-1].y, segB[bi].x, segB[bi].y,
              )
              if (!pt) continue
              if (events.some(e => Math.hypot(e.x - pt.x, e.y - pt.y) < 35)) continue

              const isBig = lines[i].isMajor || lines[j].isMajor
              const rings = isBig ? 2 + Math.floor(Math.random() * 2) : 1

              events.push({
                x: pt.x, y: pt.y,
                life: 0, maxLife: 140 + Math.random() * 80,
                radius: isBig ? 5 + Math.random() * 5 : 3 + Math.random() * 3,
                rings,
              })

              // Spawn sparks at major crossings
              if (isBig) {
                const count = 4 + Math.floor(Math.random() * 5)
                for (let s = 0; s < count; s++) {
                  const a = Math.random() * Math.PI * 2
                  const spd = 0.4 + Math.random() * 0.9
                  sparks.push({
                    x: pt.x, y: pt.y,
                    vx: Math.cos(a) * spd, vy: Math.sin(a) * spd,
                    life: 0, maxLife: 55 + Math.random() * 45,
                    size: 0.8 + Math.random() * 1.2,
                  })
                }
              }

              found = true
              break outer
            }
          }
          if (found) break
        }
      }
    }

    // ── Draw life events ─────────────────────────────────────────────
    events = events.filter(e => e.life < e.maxLife)
    for (const ev of events) {
      ev.life++
      const p       = ev.life / ev.maxLife
      const fadeIn  = Math.min(p / 0.15, 1)
      const fadeOut = p > 0.6 ? 1 - (p - 0.6) / 0.4 : 1
      const alpha   = fadeIn * fadeOut

      for (let ri = 0; ri < ev.rings; ri++) {
        const delay  = ri * 0.18
        const rp     = Math.max(0, p - delay)
        const rAlpha = Math.min(rp / 0.15, 1) * (p > 0.6 ? 1 - (p - 0.6) / 0.4 : 1)
        if (rAlpha <= 0) continue
        const r = ev.radius * (1 + ri * 0.6) + rp * ev.radius * 3

        ctx.beginPath()
        ctx.arc(ev.x, ev.y, r, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(196,150,74,${(rAlpha * (0.55 - ri * 0.12)).toFixed(3)})`
        ctx.lineWidth   = 0.8 - ri * 0.15
        ctx.stroke()
      }

      // Soft halo
      const haloR = ev.radius * 2 + p * ev.radius * 4
      const grad  = ctx.createRadialGradient(ev.x, ev.y, 0, ev.x, ev.y, haloR)
      grad.addColorStop(0,   `rgba(196,150,74,${(alpha * 0.28).toFixed(3)})`)
      grad.addColorStop(0.5, `rgba(196,150,74,${(alpha * 0.09).toFixed(3)})`)
      grad.addColorStop(1,   'rgba(196,150,74,0)')
      ctx.beginPath()
      ctx.arc(ev.x, ev.y, haloR, 0, Math.PI * 2)
      ctx.fillStyle = grad
      ctx.fill()

      // Centre dot — brighter as event "peaks"
      const dotAlpha = alpha * (ev.rings > 1 ? 1.0 : 0.75)
      ctx.beginPath()
      ctx.arc(ev.x, ev.y, 1.8 + ev.rings * 0.4, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(220,175,100,${Math.min(dotAlpha, 0.95).toFixed(3)})`
      ctx.fill()
    }

    // ── Draw sparks ──────────────────────────────────────────────────
    sparks = sparks.filter(s => s.life < s.maxLife)
    for (const sp of sparks) {
      sp.life++
      sp.x += sp.vx
      sp.y += sp.vy
      sp.vx *= 0.96
      sp.vy *= 0.96

      const p     = sp.life / sp.maxLife
      const alpha = (1 - p) * (1 - p) * 0.75

      ctx.beginPath()
      ctx.arc(sp.x, sp.y, sp.size * (1 - p * 0.5), 0, Math.PI * 2)
      ctx.fillStyle = `rgba(220,180,100,${alpha.toFixed(3)})`
      ctx.fill()
    }

    raf = requestAnimationFrame(tick)
  }

  tick()

  return () => {
    cancelAnimationFrame(raf)
    window.removeEventListener('resize', resize)
  }
}

export function LifeLinesCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const cv = canvasRef.current
    if (!cv) return
    const ctx = cv.getContext('2d')
    if (!ctx) return
    return run(cv, ctx)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 w-full h-full"
    />
  )
}
