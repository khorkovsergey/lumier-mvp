'use client'

import { useEffect, useRef } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface LifeLine {
  id: number
  x: number; y: number
  angle: number; speed: number
  wobbleOffset: number; wobbleSpeed: number; wobbleAmp: number
  life: number; maxLife: number
  trail: { x: number; y: number }[]
  baseOpacity: number; thickness: number
  isMajor: boolean
  // Set when the line has just collided — so we don't double-trigger
  collided: boolean
}

interface Spark {
  x: number; y: number; vx: number; vy: number
  life: number; maxLife: number; size: number
}

interface LifeEvent {          // lines crossing each other
  x: number; y: number
  life: number; maxLife: number
  radius: number; rings: number
}

interface CollisionFlash {     // line hitting a letter
  x: number; y: number
  life: number; maxLife: number
  r0: number                   // initial radius (scales with line importance)
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

let _id = 0

function spawnLine(W: number, H: number): LifeLine {
  const edge = Math.floor(Math.random() * 4)
  let x = 0, y = 0, angle = 0
  if (edge === 0) { x = Math.random() * W; y = -6;    angle = Math.PI * 0.12 + Math.random() * Math.PI * 0.76 }
  else if (edge === 1) { x = W + 6; y = Math.random() * H; angle = Math.PI * 0.62 + Math.random() * Math.PI * 0.76 }
  else if (edge === 2) { x = Math.random() * W; y = H + 6; angle = Math.PI * 1.12 + Math.random() * Math.PI * 0.76 }
  else { x = -6; y = Math.random() * H; angle = -Math.PI * 0.38 + Math.random() * Math.PI * 0.76 }

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
    baseOpacity: isMajor ? 0.55 + Math.random() * 0.2 : 0.3 + Math.random() * 0.2,
    thickness:   isMajor ? 1.2 + Math.random() * 0.8 : 0.5 + Math.random() * 0.5,
    isMajor,
    collided: false,
  }
}

function segIntersect(
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

function drawSmoothLine(
  ctx: CanvasRenderingContext2D,
  pts: { x: number; y: number }[],
  opacityFn: (t: number) => number,
  thickness: number,
  isMajor: boolean,
) {
  if (pts.length < 3) return
  const N    = pts.length
  const STEP = isMajor ? 3 : 4
  for (let i = STEP; i < N; i += STEP) {
    const t0    = (i - STEP) / N
    const t1    = i / N
    const alpha = opacityFn((t0 + t1) / 2)
    if (alpha < 0.005) continue
    ctx.beginPath()
    ctx.moveTo(pts[i - STEP].x, pts[i - STEP].y)
    for (let k = i - STEP + 1; k <= i && k < N; k++) {
      const prev = pts[k - 1], curr = pts[k]
      ctx.quadraticCurveTo(prev.x, prev.y, (prev.x + curr.x) / 2, (prev.y + curr.y) / 2)
    }
    ctx.strokeStyle = `rgba(212,149,74,${alpha.toFixed(3)})`
    ctx.lineWidth   = thickness * (0.4 + t1 * 0.8)
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'
    ctx.stroke()
  }
}

// ─── Main loop ────────────────────────────────────────────────────────────────

function run(cv: HTMLCanvasElement, ctx: CanvasRenderingContext2D): () => void {
  let W = 0, H = 0
  let raf: number
  let frame = 0

  let lines:      LifeLine[]      = []
  let events:     LifeEvent[]     = []
  let sparks:     Spark[]         = []
  let collisions: CollisionFlash[] = []

  // ── Letter mask ────────────────────────────────────────────────────
  let letterMask: Uint8ClampedArray | null = null

  function isInLetter(x: number, y: number): boolean {
    if (!letterMask) return false
    const px = Math.floor(x), py = Math.floor(y)
    if (px < 0 || px >= W || py < 0 || py >= H) return false
    return letterMask[(py * W + px) * 4 + 3] > 80
  }

  async function buildMask() {
    await document.fonts.ready
    const h1 = document.querySelector('h1')
    if (!h1) return
    const rect   = h1.getBoundingClientRect()
    const fSize  = parseFloat(getComputedStyle(h1).fontSize)
    const spacing = fSize * 0.08

    const off  = document.createElement('canvas')
    off.width  = W; off.height = H
    const oc   = off.getContext('2d')!
    oc.clearRect(0, 0, W, H)
    oc.fillStyle    = 'white'
    oc.font         = `300 ${fSize}px "Cormorant Garamond", Georgia, serif`
    oc.textBaseline = 'middle'

    const cx = rect.left + rect.width / 2
    const cy = rect.top  + rect.height / 2

    // Draw each character with manual letter-spacing for max browser compat
    const chars = 'Lumier'.split('')
    const widths = chars.map(c => oc.measureText(c).width)
    const total  = widths.reduce((a, b) => a + b, 0) + spacing * (chars.length - 1)
    let tx = cx - total / 2
    for (let i = 0; i < chars.length; i++) {
      oc.fillText(chars[i], tx, cy)
      tx += widths[i] + spacing
    }

    letterMask = oc.getImageData(0, 0, W, H).data
  }

  // ── Resize ─────────────────────────────────────────────────────────
  function resize() {
    W = window.innerWidth;  cv.width  = W
    H = window.innerHeight; cv.height = H
    buildMask()
  }
  resize()
  window.addEventListener('resize', resize)
  // Rebuild mask once fonts definitely loaded
  setTimeout(buildMask, 600)

  // ── Pre-populate ────────────────────────────────────────────────────
  for (let i = 0; i < 18; i++) {
    const l    = spawnLine(W, H)
    const skip = Math.floor(Math.random() * l.maxLife * 0.55)
    for (let j = 0; j < skip; j++) {
      const wb = Math.sin(l.wobbleOffset + j * l.wobbleSpeed) * l.wobbleAmp
      l.x += Math.cos(l.angle) * l.speed + Math.cos(l.angle + Math.PI / 2) * wb * 0.05
      l.y += Math.sin(l.angle) * l.speed + Math.sin(l.angle + Math.PI / 2) * wb * 0.05
      if (l.trail.length < 150) l.trail.push({ x: l.x, y: l.y })
    }
    l.life = skip
    lines.push(l)
  }

  const TRAIL_MAX = 150
  const OFFSCREEN = 180

  // ── Helpers for collision effects ───────────────────────────────────
  function spawnCollision(x: number, y: number, isMajor: boolean) {
    collisions.push({ x, y, life: 0, maxLife: 70 + Math.random() * 40, r0: isMajor ? 14 : 8 })
    const cnt = isMajor ? 14 + Math.floor(Math.random() * 8) : 7 + Math.floor(Math.random() * 5)
    for (let s = 0; s < cnt; s++) {
      const a   = Math.random() * Math.PI * 2
      const spd = isMajor ? 1.4 + Math.random() * 2.2 : 0.8 + Math.random() * 1.4
      sparks.push({
        x, y,
        vx: Math.cos(a) * spd, vy: Math.sin(a) * spd,
        life: 0, maxLife: 35 + Math.random() * 40,
        size: isMajor ? 1.8 + Math.random() * 2.2 : 0.8 + Math.random() * 1.5,
      })
    }
  }

  // ── Tick ────────────────────────────────────────────────────────────
  function tick() {
    frame++
    ctx.clearRect(0, 0, W, H)

    // Spawn
    if (lines.length < 22 && frame % 55 === 0) lines.push(spawnLine(W, H))

    // ── Lines ──────────────────────────────────────────────────────
    const dead: number[] = []

    for (const ln of lines) {
      ln.life++
      const wb   = Math.sin(ln.wobbleOffset + ln.life * ln.wobbleSpeed) * ln.wobbleAmp
      ln.x += Math.cos(ln.angle) * ln.speed + Math.cos(ln.angle + Math.PI / 2) * wb * 0.06
      ln.y += Math.sin(ln.angle) * ln.speed + Math.sin(ln.angle + Math.PI / 2) * wb * 0.06
      ln.trail.push({ x: ln.x, y: ln.y })
      if (ln.trail.length > TRAIL_MAX) ln.trail.shift()

      if (
        ln.life > ln.maxLife ||
        ln.x < -OFFSCREEN || ln.x > W + OFFSCREEN ||
        ln.y < -OFFSCREEN || ln.y > H + OFFSCREEN
      ) { dead.push(ln.id); continue }

      // ── Letter collision check ────────────────────────────────────
      if (!ln.collided && letterMask && ln.trail.length > 10) {
        // Check the last 3 trail points for a hit (so we don't miss fast lines)
        const tail = ln.trail.slice(-3)
        for (const pt of tail) {
          if (isInLetter(pt.x, pt.y)) {
            ln.collided = true
            dead.push(ln.id)
            spawnCollision(pt.x, pt.y, ln.isMajor)
            break
          }
        }
        if (ln.collided) continue
      }

      if (ln.trail.length < 4) continue

      const prog     = ln.life / ln.maxLife
      const lifeFade = prog < 0.08 ? prog / 0.08 : prog > 0.82 ? (1 - prog) / 0.18 : 1

      drawSmoothLine(ctx, ln.trail, (t) => t * t * ln.baseOpacity * lifeFade, ln.thickness, ln.isMajor)

      // Head glow
      const ha = ln.baseOpacity * lifeFade * (ln.isMajor ? 2.2 : 1.6)
      if (ln.isMajor) {
        const g = ctx.createRadialGradient(ln.x, ln.y, 0, ln.x, ln.y, ln.thickness * 5)
        g.addColorStop(0, `rgba(212,149,74,${Math.min(ha * 0.6, 0.5).toFixed(3)})`)
        g.addColorStop(1, 'rgba(212,149,74,0)')
        ctx.beginPath(); ctx.arc(ln.x, ln.y, ln.thickness * 5, 0, Math.PI * 2)
        ctx.fillStyle = g; ctx.fill()
      }
      ctx.beginPath(); ctx.arc(ln.x, ln.y, ln.thickness * 1.4, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(212,149,74,${Math.min(ha, 0.7).toFixed(3)})`; ctx.fill()
    }
    lines = lines.filter(l => !dead.includes(l.id))

    // ── Intersection detection ──────────────────────────────────────
    if (frame % 2 === 0 && events.length < 24) {
      const TAIL = 12
      for (let i = 0; i < lines.length; i++) {
        for (let j = i + 1; j < lines.length; j++) {
          const ta = lines[i].trail, tb = lines[j].trail
          if (ta.length < 2 || tb.length < 2) continue
          const segA = ta.slice(-TAIL), segB = tb.slice(-TAIL)
          let found = false
          outer:
          for (let ai = 1; ai < segA.length; ai++) {
            for (let bi = 1; bi < segB.length; bi++) {
              const pt = segIntersect(
                segA[ai-1].x, segA[ai-1].y, segA[ai].x, segA[ai].y,
                segB[bi-1].x, segB[bi-1].y, segB[bi].x, segB[bi].y,
              )
              if (!pt) continue
              if (events.some(e => Math.hypot(e.x - pt.x, e.y - pt.y) < 35)) continue
              const big  = lines[i].isMajor || lines[j].isMajor
              events.push({ x: pt.x, y: pt.y, life: 0, maxLife: 140 + Math.random() * 80, radius: big ? 5 + Math.random() * 5 : 3 + Math.random() * 3, rings: big ? 2 + Math.floor(Math.random() * 2) : 1 })
              if (big) {
                for (let s = 0; s < 4 + Math.floor(Math.random() * 4); s++) {
                  const a = Math.random() * Math.PI * 2, spd = 0.4 + Math.random() * 0.9
                  sparks.push({ x: pt.x, y: pt.y, vx: Math.cos(a)*spd, vy: Math.sin(a)*spd, life: 0, maxLife: 55 + Math.random() * 45, size: 0.8 + Math.random() * 1.2 })
                }
              }
              found = true; break outer
            }
          }
          if (found) break
        }
      }
    }

    // ── Line-crossing events ────────────────────────────────────────
    events = events.filter(e => e.life < e.maxLife)
    for (const ev of events) {
      ev.life++
      const p = ev.life / ev.maxLife
      const fadeIn = Math.min(p / 0.15, 1), fadeOut = p > 0.6 ? 1 - (p - 0.6) / 0.4 : 1
      const alpha  = fadeIn * fadeOut
      for (let ri = 0; ri < ev.rings; ri++) {
        const rp = Math.max(0, p - ri * 0.18)
        const rA = Math.min(rp / 0.15, 1) * (p > 0.6 ? 1 - (p - 0.6) / 0.4 : 1)
        if (rA <= 0) continue
        const r = ev.radius * (1 + ri * 0.6) + rp * ev.radius * 3
        ctx.beginPath(); ctx.arc(ev.x, ev.y, r, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(212,149,74,${(rA * (0.55 - ri * 0.12)).toFixed(3)})`
        ctx.lineWidth   = 0.8 - ri * 0.15; ctx.stroke()
      }
      const hR = ev.radius * 2 + p * ev.radius * 4
      const g  = ctx.createRadialGradient(ev.x, ev.y, 0, ev.x, ev.y, hR)
      g.addColorStop(0, `rgba(212,149,74,${(alpha * 0.28).toFixed(3)})`); g.addColorStop(0.5, `rgba(212,149,74,${(alpha * 0.09).toFixed(3)})`); g.addColorStop(1, 'rgba(212,149,74,0)')
      ctx.beginPath(); ctx.arc(ev.x, ev.y, hR, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill()
      ctx.beginPath(); ctx.arc(ev.x, ev.y, 1.8 + ev.rings * 0.4, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(230,180,100,${Math.min(alpha * (ev.rings > 1 ? 1.0 : 0.75), 0.95).toFixed(3)})`; ctx.fill()
    }

    // ── Letter collision flashes ────────────────────────────────────
    collisions = collisions.filter(c => c.life < c.maxLife)
    for (const cf of collisions) {
      cf.life++
      const p = cf.life / cf.maxLife

      // Phase 1 (0–25%): intense white-gold burst
      if (p < 0.25) {
        const bp  = 1 - p / 0.25
        const bR  = cf.r0 * (1 + p * 5)
        const bg  = ctx.createRadialGradient(cf.x, cf.y, 0, cf.x, cf.y, bR)
        bg.addColorStop(0,   `rgba(255,240,200,${(bp * 0.95).toFixed(3)})`)
        bg.addColorStop(0.3, `rgba(220,175,80,${(bp * 0.55).toFixed(3)})`)
        bg.addColorStop(1,   'rgba(212,149,74,0)')
        ctx.beginPath(); ctx.arc(cf.x, cf.y, bR, 0, Math.PI * 2)
        ctx.fillStyle = bg; ctx.fill()
      }

      // Expanding rings (3 rings staggered)
      for (let ri = 0; ri < 3; ri++) {
        const rp     = Math.max(0, p - ri * 0.12)
        const fadeOut = rp > 0.45 ? 1 - (rp - 0.45) / 0.55 : 1
        const rAlpha  = Math.min(rp / 0.08, 1) * fadeOut * (0.7 - ri * 0.18)
        if (rAlpha < 0.01) continue
        const r = cf.r0 * (1.2 + ri * 0.7) + rp * cf.r0 * 5

        ctx.beginPath(); ctx.arc(cf.x, cf.y, r, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(230,180,100,${rAlpha.toFixed(3)})`
        ctx.lineWidth   = 1.4 - ri * 0.35; ctx.stroke()
      }

      // Fading centre dot
      const dotAlpha = Math.max(0, 1 - p * 2.5)
      if (dotAlpha > 0) {
        ctx.beginPath(); ctx.arc(cf.x, cf.y, 2.5, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,240,200,${dotAlpha.toFixed(3)})`; ctx.fill()
      }
    }

    // ── Sparks (shared by crossings + collisions) ───────────────────
    sparks = sparks.filter(s => s.life < s.maxLife)
    for (const sp of sparks) {
      sp.life++; sp.x += sp.vx; sp.y += sp.vy; sp.vx *= 0.96; sp.vy *= 0.96
      const p     = sp.life / sp.maxLife
      const alpha = (1 - p) * (1 - p) * 0.82
      ctx.beginPath(); ctx.arc(sp.x, sp.y, sp.size * (1 - p * 0.5), 0, Math.PI * 2)
      ctx.fillStyle = `rgba(235,190,115,${alpha.toFixed(3)})`; ctx.fill()
    }

    raf = requestAnimationFrame(tick)
  }

  tick()

  return () => {
    cancelAnimationFrame(raf)
    window.removeEventListener('resize', resize)
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

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
      className="pointer-events-none absolute inset-0 w-full h-full z-[1]"
    />
  )
}
