<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'

type Flake = {
  x: number
  y: number
  r: number
  vy: number
  vx: number
  rot: number
  vr: number
  alpha: number
  sprite: number
}

const props = withDefaults(defineProps<{
  // количество снежинок (адаптивно, будет зажат сверху/снизу)
  count?: number
  // скорость падения (множитель)
  speed?: number
  // использовать картинки из /public (например /images/new-year/snowflake-1.png)
  images?: string[]
  // если картинок нет — рисуем “иконки” (кружочки) как запасной вариант
  forceDots?: boolean
}>(), {
  count: 70,
  speed: 1,
  images: () => [],
  forceDots: false,
})

const canvasRef = ref<HTMLCanvasElement | null>(null)

let raf = 0
let flakes: Flake[] = []
let ctx: CanvasRenderingContext2D | null = null

let w = 0
let h = 0
let dpr = 1

const sprites: HTMLImageElement[] = []
let spritesReady = false

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n))
}

function rand(a: number, b: number) {
  return a + Math.random() * (b - a)
}

function prefersReducedMotion() {
  if (typeof window === 'undefined') return false
  return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false
}

function resize() {
  const c = canvasRef.value
  if (!c) return

  dpr = window.devicePixelRatio || 1
  w = window.innerWidth
  h = window.innerHeight

  c.width = Math.floor(w * dpr)
  c.height = Math.floor(h * dpr)
  c.style.width = `${w}px`
  c.style.height = `${h}px`

  ctx = c.getContext('2d')
  if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
}

function makeFlake(): Flake {
  const sprite = sprites.length ? Math.floor(rand(0, sprites.length)) : 0
  const r = rand(6, sprites.length ? 18 : 10)
  return {
    x: rand(0, w),
    y: rand(-h, 0),
    r,
    vy: rand(0.6, 2.2) * props.speed,
    vx: rand(-0.35, 0.35) * props.speed,
    rot: rand(0, Math.PI * 2),
    vr: rand(-0.02, 0.02),
    alpha: rand(0.55, 1),
    sprite,
  }
}

function initFlakes() {
  const base = clamp(props.count, 20, 220)

  // Чуть адаптируем по ширине, чтобы на мобилках не было “метели”
  const k = clamp(w / 1200, 0.6, 1.2)
  const n = Math.floor(base * k)

  flakes = Array.from({ length: n }, () => makeFlake())
}

function drawDots(f: Flake) {
  if (!ctx) return
  ctx.globalAlpha = f.alpha
  ctx.beginPath()
  ctx.arc(f.x, f.y, f.r * 0.4, 0, Math.PI * 2)
  ctx.fill()
}

function drawSprite(f: Flake) {
  if (!ctx) return
  const img = sprites[f.sprite]
  if (!img) return

  ctx.save()
  ctx.globalAlpha = f.alpha
  ctx.translate(f.x, f.y)
  ctx.rotate(f.rot)
  const size = f.r
  ctx.drawImage(img, -size / 2, -size / 2, size, size)
  ctx.restore()
}

function tick() {
  if (!ctx) return
  ctx.clearRect(0, 0, w, h)

  // цвет точек (если dots)
  if (props.forceDots || !spritesReady || sprites.length === 0) {
    ctx.fillStyle = 'rgba(255,255,255,0.95)'
  }

  for (const f of flakes) {
    f.y += f.vy
    f.x += f.vx
    f.rot += f.vr

    // лёгкое “качание”
    f.x += Math.sin((f.y / 80) + f.rot) * 0.15

    if (f.y > h + 30) {
      f.y = rand(-40, -10)
      f.x = rand(0, w)
    }

    // выход за края по X — мягко переносим
    if (f.x < -30) f.x = w + 30
    if (f.x > w + 30) f.x = -30

    if (props.forceDots || !spritesReady || sprites.length === 0) drawDots(f)
    else drawSprite(f)
  }

  raf = requestAnimationFrame(tick)
}

async function loadSprites() {
  if (props.forceDots || props.images.length === 0) {
    spritesReady = true
    return
  }

  spritesReady = false
  sprites.length = 0

  await Promise.all(
    props.images.map((src) => new Promise<void>((resolve) => {
      const img = new Image()
      img.decoding = 'async'
      img.loading = 'eager'
      img.onload = () => resolve()
      img.onerror = () => resolve() // не валим сайт, просто пропускаем
      img.src = src
      sprites.push(img)
    }))
  )

  // если все упали — будем рисовать dots
  spritesReady = sprites.some(i => i.naturalWidth > 0)
}

onMounted(async () => {
  if (prefersReducedMotion()) return

  resize()
  await loadSprites()
  initFlakes()

  window.addEventListener('resize', () => {
    resize()
    initFlakes()
  }, { passive: true })

  raf = requestAnimationFrame(tick)
})

onBeforeUnmount(() => {
  if (raf) cancelAnimationFrame(raf)
})
</script>

<template>
  <!-- pointer-events-none: снег не блокирует клики -->
  <canvas ref="canvasRef" class="snowfall" aria-hidden="true"></canvas>
</template>

<style scoped>
.snowfall {
  position: fixed;
  inset: 0;
  z-index: 9999;
  pointer-events: none;
}
</style>
