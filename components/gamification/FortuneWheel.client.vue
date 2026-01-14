<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { WheelSegment, WheelResult } from '~/types/gamification'

const REQUIRED_SEGMENTS = 16

const props = defineProps<{
  segments: WheelSegment[]
  spinning?: boolean
}>()

const emit = defineEmits<{ (e: 'spin', result: WheelResult): void }>()

const canvas = ref<HTMLCanvasElement | null>(null)
const angle = ref(0)
const spinning = ref(false)
let raf: number | null = null

/** гарантируем 16 секций */
const segs = computed<WheelSegment[]>(() => {
  const base = props.segments.slice(0, REQUIRED_SEGMENTS)
  if (base.length < REQUIRED_SEGMENTS) {
    const fillerCount = REQUIRED_SEGMENTS - base.length
    for (let i = 0; i < fillerCount; i++) {
      base.push({
        id: `empty-${i}`,
        label: '—',
        type: 'none' as any,
        value: null as any,
        color: i % 2 ? '#eee' : '#ddd'
      } as WheelSegment)
    }
  }
  return base
})

function draw() {
  const c = canvas.value; if (!c) return
  const ctx = c.getContext('2d'); if (!ctx) return

  const cssSize = 320 // логический размер
  const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1))
  if (c.width !== cssSize * dpr || c.height !== cssSize * dpr) {
    c.width = cssSize * dpr
    c.height = cssSize * dpr
    c.style.width = `${cssSize}px`
    c.style.height = `${cssSize}px`
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  const width = cssSize
  const height = cssSize
  ctx.clearRect(0, 0, width, height)

  const cx = width / 2
  const cy = height / 2
  const r = Math.min(cx, cy) - 6
  const n = segs.value.length
  const step = (2 * Math.PI) / n

  // секции
  for (let i = 0; i < n; i++) {
    const start = angle.value + i * step
    const end = angle.value + (i + 1) * step
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.arc(cx, cy, r, start, end)
    ctx.closePath()
    ctx.fillStyle = segs.value[i].color || (i % 2 ? '#f3f4f6' : '#e5e7eb') // tailwind-серые
    ctx.fill()

    // текст
    ctx.save()
    ctx.translate(cx, cy)
    const mid = (start + end) / 2
    ctx.rotate(mid)
    ctx.textAlign = 'right'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = '#111'
    ctx.font = '13px system-ui, -apple-system, Segoe UI, Roboto, sans-serif'
    const label = String(segs.value[i].label ?? '')
    ctx.fillText(label, r - 12, 0)
    ctx.restore()
  }

  // стрелка (сверху, у -π/2)
  ctx.fillStyle = '#ef4444'
  ctx.beginPath()
  const tipX = cx
  const tipY = cy - r - 4
  ctx.moveTo(tipX, tipY)
  ctx.lineTo(tipX - 10, tipY + 24)
  ctx.lineTo(tipX + 10, tipY + 24)
  ctx.closePath()
  ctx.fill()

  // центр
  ctx.beginPath()
  ctx.arc(cx, cy, 12, 0, Math.PI * 2)
  ctx.fillStyle = '#111'
  ctx.fill()
}

const handleResize = () => draw()

onMounted(() => {
  draw()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (raf) cancelAnimationFrame(raf)
})

async function spin() {
  if (spinning.value) return
  spinning.value = true

  const total = segs.value.length
  const step = (2 * Math.PI) / total

  // выбор победителя
  const targetIndex = Math.floor(Math.random() * total)

  // хотим, чтобы центр секции совпал со стрелкой (которая смотрит вверх, угол -π/2)
  // Центр секции i = angle + (i + 0.5) * step
  // angle_final + (target + 0.5)*step = -π/2 + 2πk
  // => angle_final = k*2π - π/2 - (target + 0.5)*step
  const extraTurns = 6 + Math.random() * 2 // 6..8 оборотов
  const base = extraTurns * 2 * Math.PI
  const targetCenter = -Math.PI / 2
  const finalAngle = base + targetCenter - (targetIndex + 0.5) * step

  const start = performance.now()
  const duration = 3200 + Math.random() * 800 // 3.2..4.0s

  const loop = (t: number) => {
    const p = Math.min(1, (t - start) / duration)
    const eased = 1 - Math.pow(1 - p, 3) // ease-out
    angle.value = eased * finalAngle
    draw()
    if (p < 1) {
      raf = requestAnimationFrame(loop)
    } else {
      spinning.value = false
      const seg = segs.value[targetIndex]
      emit('spin', { segmentId: seg.id, type: seg.type, value: seg.value })
    }
  }
  raf = requestAnimationFrame(loop)
}
</script>

<template>
  <div class="flex flex-col items-center gap-3">
    <canvas ref="canvas" class="rounded-2xl shadow w-[920px] h-[920px]" />
    <button
      class="px-4 py-2 rounded-2xl shadow bg-black text-white disabled:opacity-50"
      :disabled="spinning"
      @click="spin"
    >
      {{ spinning ? 'Крутим...' : 'Крутить' }}
    </button>
  </div>
</template>
