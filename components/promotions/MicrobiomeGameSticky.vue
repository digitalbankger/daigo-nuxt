<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useAuthStore } from '~/stores/authStore'
import { useUserStore } from '~/stores/userStore'

type BacteriaKind = 'bad' | 'good'

type Bacteria = {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  r: number
  kind: BacteriaKind
  variant: number
  points: number
  rotation: number
  spin: number
  alive: boolean
  hitAt?: number
}

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  color: string
}

type TrailPoint = {
  x: number
  y: number
  life: number
}

const GAME_DURATION_MS = 30_000
const ENERGY_MAX = 100
const TARGET_BAD_KILLS_FOR_MAX_DISCOUNT = 36
const GOOD_BACTERIA_PENALTY = 3

const BAD_BACTERIA_SPRITES = [
  '/images/promotions/game/bad-bacteria-1.png',
  '/images/promotions/game/bad-bacteria-2.png',
  '/images/promotions/game/bad-bacteria-3.png',
]

const GOOD_BACTERIA_SPRITES = [
  '/images/promotions/game/good-bacteria-1.png',
  '/images/promotions/game/good-bacteria-2.png',
  '/images/promotions/game/good-bacteria-3.png',
]

const isOpen = ref(false)
const isPlaying = ref(false)
const isFinished = ref(false)
const isWon = ref(false)
const score = ref(0)
const badKilled = ref(0)
const goodTouched = ref(0)
const energy = ref(0)
const timeLeft = ref(Math.round(GAME_DURATION_MS / 1000))
const isRewardSubmitting = ref(false)
const gameError = ref('')
const discountWon = ref<number | null>(null)
const discountApplied = ref(false)

const canvasRef = ref<HTMLCanvasElement | null>(null)

const authStore = useAuthStore()
const userStore = useUserStore()
const route = useRoute()

let isPageScrollLockedByThisComponent = false

function getPageScrollLockCount() {
  if (!import.meta.client) return 0
  return Number(document.documentElement.dataset.daigoScrollLockCount || 0)
}

function lockPageScroll() {
  if (!import.meta.client || isPageScrollLockedByThisComponent) return

  const html = document.documentElement
  const body = document.body
  const currentLockCount = getPageScrollLockCount()

  if (currentLockCount === 0) {
    const scrollY = window.scrollY || window.pageYOffset || 0

    html.dataset.daigoScrollY = String(scrollY)
    html.dataset.daigoScrollHtmlOverflow = html.style.overflow
    html.dataset.daigoScrollBodyPosition = body.style.position
    html.dataset.daigoScrollBodyTop = body.style.top
    html.dataset.daigoScrollBodyLeft = body.style.left
    html.dataset.daigoScrollBodyRight = body.style.right
    html.dataset.daigoScrollBodyWidth = body.style.width
    html.dataset.daigoScrollBodyOverflow = body.style.overflow

    html.classList.add('daigo-page-scroll-locked')
    body.classList.add('daigo-page-scroll-locked', 'daigo-modal-open')

    html.style.overflow = 'hidden'
    body.style.position = 'fixed'
    body.style.top = `-${scrollY}px`
    body.style.left = '0'
    body.style.right = '0'
    body.style.width = '100%'
    body.style.overflow = 'hidden'
  } else {
    body.classList.add('daigo-modal-open')
  }

  html.dataset.daigoScrollLockCount = String(currentLockCount + 1)
  isPageScrollLockedByThisComponent = true
}

function unlockPageScroll() {
  if (!import.meta.client || !isPageScrollLockedByThisComponent) return

  const html = document.documentElement
  const body = document.body
  const nextLockCount = Math.max(0, getPageScrollLockCount() - 1)

  isPageScrollLockedByThisComponent = false

  if (nextLockCount > 0) {
    html.dataset.daigoScrollLockCount = String(nextLockCount)
    return
  }

  const scrollY = Number(html.dataset.daigoScrollY || 0)

  html.classList.remove('daigo-page-scroll-locked')
  body.classList.remove('daigo-page-scroll-locked', 'daigo-modal-open')

  html.style.overflow = html.dataset.daigoScrollHtmlOverflow || ''
  body.style.position = html.dataset.daigoScrollBodyPosition || ''
  body.style.top = html.dataset.daigoScrollBodyTop || ''
  body.style.left = html.dataset.daigoScrollBodyLeft || ''
  body.style.right = html.dataset.daigoScrollBodyRight || ''
  body.style.width = html.dataset.daigoScrollBodyWidth || ''
  body.style.overflow = html.dataset.daigoScrollBodyOverflow || ''

  delete html.dataset.daigoScrollLockCount
  delete html.dataset.daigoScrollY
  delete html.dataset.daigoScrollHtmlOverflow
  delete html.dataset.daigoScrollBodyPosition
  delete html.dataset.daigoScrollBodyTop
  delete html.dataset.daigoScrollBodyLeft
  delete html.dataset.daigoScrollBodyRight
  delete html.dataset.daigoScrollBodyWidth
  delete html.dataset.daigoScrollBodyOverflow

  window.scrollTo(0, scrollY)
}


let ctx: CanvasRenderingContext2D | null = null
let animationFrame = 0
let lastFrameTime = 0
let startedAt = 0
let lastSpawnAt = 0
let bacteriaSeed = 1
let pointerActive = false
let canvasWidth = 0
let canvasHeight = 0
let dpr = 1

const bacteria: Bacteria[] = []
const particles: Particle[] = []
const trail: TrailPoint[] = []

const bacteriaSprites: Record<BacteriaKind, HTMLImageElement[]> = {
  bad: [],
  good: [],
}
let bacteriaSpritesPromise: Promise<void> | null = null

const effectiveBadKills = computed(() => Math.max(0, badKilled.value - goodTouched.value * GOOD_BACTERIA_PENALTY))
const currentDiscount = computed(() => calculateDiscountByKills(effectiveBadKills.value))
const energyPercent = computed(() => Math.min(100, Math.max(0, Math.round((effectiveBadKills.value / TARGET_BAD_KILLS_FOR_MAX_DISCOUNT) * 100))))
const panelTitle = computed(() => {
  if (discountWon.value !== null) return discountApplied.value ? 'Скидка применена' : 'Игра завершена'
  if (isPlaying.value) return 'Ловите бактерии'
  return 'Игра на скидку'
})

function calculateDiscountByKills(kills: number) {
  if (kills >= 36) return 15
  if (kills >= 30) return 12
  if (kills >= 24) return 10
  if (kills >= 18) return 7
  if (kills >= 12) return 5
  if (kills >= 6) return 3
  return 0
}

function preloadSprite(src: string) {
  return new Promise<HTMLImageElement | null>((resolve) => {
    if (!import.meta.client) {
      resolve(null)
      return
    }

    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => resolve(null)
    image.src = src
  })
}

function preloadBacteriaSprites() {
  if (!import.meta.client) return Promise.resolve()
  if (bacteriaSpritesPromise) return bacteriaSpritesPromise

  bacteriaSpritesPromise = Promise.all([
    ...BAD_BACTERIA_SPRITES.map((src) => preloadSprite(src)),
    ...GOOD_BACTERIA_SPRITES.map((src) => preloadSprite(src)),
  ]).then((images) => {
    bacteriaSprites.bad = images.slice(0, BAD_BACTERIA_SPRITES.length).filter(Boolean) as HTMLImageElement[]
    bacteriaSprites.good = images.slice(BAD_BACTERIA_SPRITES.length).filter(Boolean) as HTMLImageElement[]
  })

  return bacteriaSpritesPromise
}


function authHeaders() {
  const headers: Record<string, string> = {}
  if (authStore.token) headers.Authorization = `Bearer ${authStore.token}`
  return headers
}

async function ensureGameAuthenticated() {
  if (authStore.isAuthenticated && authStore.userId) return true

  gameError.value = 'Чтобы сыграть и получить результат, сначала авторизуйтесь.'
  authStore.openAuth(route.fullPath)
  return false
}

async function getUserPhoneDigits() {
  try {
    await userStore.loadProfile()
  } catch (error) {
    console.warn('[microbiome-game] profile load failed', error)
  }

  return String(userStore.profile?.phone_number || '').replace(/\D/g, '')
}


function toggle() {
  isOpen.value = !isOpen.value
  if (isOpen.value && isPlaying.value) {
    nextTick(() => resizeCanvas())
  }
}

function close() {
  isOpen.value = false
  unlockPageScroll()
  stopLoop()
  isPlaying.value = false
}

async function goToCatalog() {
  close()
  await nextTick()
  await router.push('/catalog')
}

function resetGameState() {
  score.value = 0
  badKilled.value = 0
  goodTouched.value = 0
  energy.value = 0
  timeLeft.value = Math.round(GAME_DURATION_MS / 1000)
  isRewardSubmitting.value = false
  gameError.value = ''
  discountWon.value = null
  discountApplied.value = false
  isFinished.value = false
  isWon.value = false
  bacteria.length = 0
  particles.length = 0
  trail.length = 0
}

async function startGame() {
  await preloadBacteriaSprites()
  resetGameState()
  isPlaying.value = true

  if (authStore.isAuthenticated) {
    try {
      await userStore.loadProfile()
    } catch (error) {
      console.warn('[microbiome-game] profile prefetch failed', error)
    }
  }

  await nextTick()
  resizeCanvas()
  startedAt = performance.now()
  lastFrameTime = startedAt
  lastSpawnAt = startedAt - 520
  stopLoop()
  animationFrame = requestAnimationFrame(tick)
}

function stopLoop() {
  if (animationFrame) cancelAnimationFrame(animationFrame)
  animationFrame = 0
}

function finishGame(won: boolean) {
  if (won) energy.value = ENERGY_MAX

  isPlaying.value = false
  isFinished.value = true
  isWon.value = won
  stopLoop()

  const filling = currentDiscount.value
  void sendGameResult(filling)
}

async function sendGameResult(filling: number) {
  if (!authStore.isAuthenticated || !authStore.userId) {
    gameError.value = 'Вы выиграли скидку. Авторизуйтесь, чтобы мы смогли её применить.'
    discountWon.value = filling
    authStore.openAuth(route.fullPath)
    return
  }

  const phoneDigits = await getUserPhoneDigits()

  if (phoneDigits.length < 11) {
    gameError.value = 'Не удалось получить телефон пользователя для начисления скидки.'
    discountWon.value = filling
    return
  }

  isRewardSubmitting.value = true
  gameError.value = ''

  try {
    const response = await $fetch<{ discount_won: number; discount_applied: boolean }>(`/api/shop/promotion/${authStore.userId}/play`, {
      method: 'POST',
      headers: authHeaders(),
      body: {
        phone_number: Number(phoneDigits),
        filling,
      },
    })

    discountWon.value = Number(response.discount_won ?? filling)
    discountApplied.value = Boolean(response.discount_applied)
  } catch (error: any) {
    discountWon.value = filling
    gameError.value =
      error?.data?.message ||
      error?.data?.statusMessage ||
      error?.statusMessage ||
      error?.message ||
      'Не удалось сохранить результат игры. Попробуйте позже.'
  } finally {
    isRewardSubmitting.value = false
  }
}

function resizeCanvas() {
  const canvas = canvasRef.value
  if (!canvas) return

  const rect = canvas.getBoundingClientRect()
  dpr = Math.min(window.devicePixelRatio || 1, 2)
  canvasWidth = Math.max(1, Math.floor(rect.width))
  canvasHeight = Math.max(1, Math.floor(rect.height))
  canvas.width = Math.floor(canvasWidth * dpr)
  canvas.height = Math.floor(canvasHeight * dpr)
  ctx = canvas.getContext('2d')

  if (ctx) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }
}

function spawnBacteria(now: number) {
  const progress = Math.min(1, Math.max(0, (now - startedAt) / GAME_DURATION_MS))
  const spawnInterval = 440 - progress * 140
  if (now - lastSpawnAt < spawnInterval) return
  lastSpawnAt = now

  const spawnCount = Math.random() < progress * .22 ? 2 : 1

  for (let count = 0; count < spawnCount; count++) {
    const isBad = Math.random() > .42
    const radius = isBad ? 20 + Math.random() * 12 : 18 + Math.random() * 10
    const spawnType = Math.random()
    let x = 0
    let y = 0
    let targetX = 0
    let targetY = 0

    if (spawnType < .58) {
      x = canvasWidth * (.08 + Math.random() * .84)
      y = canvasHeight + radius + Math.random() * 90
      targetX = Math.min(canvasWidth * .94, Math.max(canvasWidth * .06, x + (Math.random() - .5) * canvasWidth * .54))
      targetY = canvasHeight * (.06 + Math.random() * .62)
    } else if (spawnType < .79) {
      x = -radius - Math.random() * 52
      y = canvasHeight * (.14 + Math.random() * .68)
      targetX = canvasWidth * (.38 + Math.random() * .52)
      targetY = canvasHeight * (.06 + Math.random() * .76)
    } else {
      x = canvasWidth + radius + Math.random() * 52
      y = canvasHeight * (.14 + Math.random() * .68)
      targetX = canvasWidth * (.08 + Math.random() * .50)
      targetY = canvasHeight * (.06 + Math.random() * .76)
    }

    const flight = 980 - progress * 360 + Math.random() * 460
    const variant = Math.floor(Math.random() * (isBad ? BAD_BACTERIA_SPRITES.length : GOOD_BACTERIA_SPRITES.length))
    const points = isBad && Math.random() < .06 + progress * .06 ? 2 : 1

    bacteria.push({
      id: bacteriaSeed++,
      x,
      y,
      vx: (targetX - x) / flight,
      vy: (targetY - y) / flight,
      r: radius * (points === 2 ? 1.15 : 1),
      kind: isBad ? 'bad' : 'good',
      variant,
      points,
      rotation: Math.random() * Math.PI * 2,
      spin: (Math.random() - .5) * (.010 + progress * .006),
      alive: true,
    })
  }
}

function tick(now: number) {
  const dt = Math.min(34, now - lastFrameTime)
  lastFrameTime = now

  const elapsed = now - startedAt
  timeLeft.value = Math.max(0, Math.ceil((GAME_DURATION_MS - elapsed) / 1000))

  if (elapsed >= GAME_DURATION_MS) {
    finishGame(currentDiscount.value > 0)
    drawScene()
    return
  }

  spawnBacteria(now)
  updateEntities(dt)
  drawScene()

  animationFrame = requestAnimationFrame(tick)
}

function updateEntities(dt: number) {
  for (let index = bacteria.length - 1; index >= 0; index--) {
    const item = bacteria[index]

    if (!item.alive) {
      if (item.hitAt && performance.now() - item.hitAt > 260) bacteria.splice(index, 1)
      continue
    }

    item.vy += .000045 * dt
    item.x += item.vx * dt
    item.y += item.vy * dt
    item.rotation += item.spin * dt

    if (item.y > canvasHeight + 150 || item.y < -120 || item.x < -150 || item.x > canvasWidth + 150) {
      bacteria.splice(index, 1)
    }
  }

  for (let index = particles.length - 1; index >= 0; index--) {
    const p = particles[index]
    p.x += p.vx * dt
    p.y += p.vy * dt
    p.vy += .001 * dt
    p.life -= dt
    if (p.life <= 0) particles.splice(index, 1)
  }

  for (let index = trail.length - 1; index >= 0; index--) {
    trail[index].life -= dt
    if (trail[index].life <= 0) trail.splice(index, 1)
  }
}

function addParticles(x: number, y: number, kind: BacteriaKind) {
  const color = kind === 'bad' ? '#ff6c8f' : '#70e7a3'

  for (let i = 0; i < 12; i++) {
    const angle = Math.random() * Math.PI * 2
    const speed = .06 + Math.random() * .18
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 360 + Math.random() * 220,
      maxLife: 580,
      color,
    })
  }
}

function hitBacteria(x: number, y: number) {
  if (!isPlaying.value) return

  for (const item of bacteria) {
    if (!item.alive) continue

    const distance = Math.hypot(item.x - x, item.y - y)
    if (distance > item.r + 10) continue

    item.alive = false
    item.hitAt = performance.now()
    addParticles(item.x, item.y, item.kind)

    if (item.kind === 'bad') {
      badKilled.value += item.points
      score.value += item.points * 10
    } else {
      goodTouched.value += 1
      score.value = Math.max(0, score.value - 15)
    }
  }
}

function pointerPosition(event: PointerEvent) {
  const canvas = canvasRef.value
  if (!canvas) return null

  const rect = canvas.getBoundingClientRect()
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  }
}

function onPointerDown(event: PointerEvent) {
  pointerActive = true
  canvasRef.value?.setPointerCapture?.(event.pointerId)
  const point = pointerPosition(event)
  if (!point) return
  trail.push({ ...point, life: 220 })
  hitBacteria(point.x, point.y)
}

function onPointerMove(event: PointerEvent) {
  if (!isPlaying.value) return
  if (event.pointerType !== 'mouse' && !pointerActive) return

  const point = pointerPosition(event)
  if (!point) return

  trail.push({ ...point, life: 220 })
  if (trail.length > 26) trail.shift()
  hitBacteria(point.x, point.y)
}

function onPointerUp(event: PointerEvent) {
  pointerActive = false
  canvasRef.value?.releasePointerCapture?.(event.pointerId)
}

function drawScene() {
  if (!ctx) return

  ctx.clearRect(0, 0, canvasWidth, canvasHeight)

  const bg = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight)
  bg.addColorStop(0, '#fff8f3')
  bg.addColorStop(.48, '#ffffff')
  bg.addColorStop(1, '#fff0f6')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, canvasWidth, canvasHeight)

  const glow = ctx.createRadialGradient(canvasWidth * .72, canvasHeight * .18, 0, canvasWidth * .72, canvasHeight * .18, canvasWidth * .48)
  glow.addColorStop(0, 'rgba(242, 67, 145, .18)')
  glow.addColorStop(.58, 'rgba(255, 133, 80, .08)')
  glow.addColorStop(1, 'rgba(242, 67, 145, 0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, canvasWidth, canvasHeight)

  drawMicroDots()

  for (const item of bacteria) drawBacteria(item)
  drawParticles()
  drawTrail()
}

function drawMicroDots() {
  if (!ctx) return

  ctx.save()
  ctx.globalAlpha = .18

  for (let i = 0; i < 20; i++) {
    const x = (i * 53) % Math.max(canvasWidth, 1)
    const y = (i * 79) % Math.max(canvasHeight, 1)
    ctx.beginPath()
    ctx.arc(x, y, 2 + (i % 4), 0, Math.PI * 2)
    ctx.fillStyle = i % 2 ? '#f24391' : '#70e7a3'
    ctx.fill()
  }

  ctx.restore()
}

function drawBacteria(item: Bacteria) {
  if (!ctx) return

  ctx.save()
  ctx.translate(item.x, item.y)
  ctx.rotate(item.rotation)
  ctx.globalAlpha = item.alive ? 1 : .25

  const sprite = bacteriaSprites[item.kind]?.[item.variant]

  if (sprite?.complete && sprite.naturalWidth > 0 && sprite.naturalHeight > 0) {
    const height = item.r * (item.points === 2 ? 3.6 : 3.2)
    const width = height * (sprite.naturalWidth / sprite.naturalHeight)

    ctx.shadowColor = item.kind === 'bad' ? 'rgba(242, 67, 145, .30)' : 'rgba(52, 211, 153, .26)'
    ctx.shadowBlur = item.alive ? 16 : 0
    ctx.drawImage(sprite, -width / 2, -height / 2, width, height)

    if (item.points === 2 && item.alive) {
      ctx.shadowBlur = 0
      ctx.fillStyle = 'rgba(255,255,255,.88)'
      ctx.strokeStyle = item.kind === 'bad' ? '#f24391' : '#22c55e'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(width * .30, -height * .28, 12, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
      ctx.fillStyle = item.kind === 'bad' ? '#d9307a' : '#15803d'
      ctx.font = '700 12px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('×2', width * .30, -height * .28)
    }

    ctx.restore()
    return
  }

  const isBad = item.kind === 'bad'
  const fill = isBad ? '#ff6c8f' : '#70e7a3'
  const stroke = isBad ? '#ba2f58' : '#159866'

  ctx.fillStyle = fill
  ctx.strokeStyle = stroke
  ctx.lineWidth = 2

  for (let i = 0; i < 10; i++) {
    const angle = (Math.PI * 2 / 10) * i
    const sx = Math.cos(angle) * item.r * .84
    const sy = Math.sin(angle) * item.r * .84
    ctx.beginPath()
    ctx.moveTo(sx, sy)
    ctx.lineTo(Math.cos(angle) * item.r * 1.26, Math.sin(angle) * item.r * 1.26)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(Math.cos(angle) * item.r * 1.34, Math.sin(angle) * item.r * 1.34, 2.5, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.beginPath()
  ctx.ellipse(0, 0, item.r * 1.04, item.r * .82, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()

  ctx.restore()
}

function drawParticles() {
  if (!ctx) return

  particles.forEach((p) => {
    ctx!.save()
    ctx!.globalAlpha = Math.max(0, p.life / p.maxLife)
    ctx!.fillStyle = p.color
    ctx!.beginPath()
    ctx!.arc(p.x, p.y, 3.2, 0, Math.PI * 2)
    ctx!.fill()
    ctx!.restore()
  })
}

function drawTrail() {
  if (!ctx || trail.length < 2) return

  ctx.save()
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  for (let i = 1; i < trail.length; i++) {
    const prev = trail[i - 1]
    const point = trail[i]
    const alpha = Math.max(0, Math.min(1, point.life / 220))

    ctx.shadowColor = `rgba(242, 67, 145, ${alpha * .52})`
    ctx.shadowBlur = 14 * alpha
    ctx.strokeStyle = `rgba(242, 67, 145, ${alpha * .78})`
    ctx.lineWidth = 10 * alpha + 3
    ctx.beginPath()
    ctx.moveTo(prev.x, prev.y)
    ctx.lineTo(point.x, point.y)
    ctx.stroke()

    ctx.shadowBlur = 0
    ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * .82})`
    ctx.lineWidth = 4 * alpha + 1
    ctx.beginPath()
    ctx.moveTo(prev.x, prev.y)
    ctx.lineTo(point.x, point.y)
    ctx.stroke()
  }

  const last = trail[trail.length - 1]
  ctx.translate(last.x, last.y)
  ctx.rotate(-Math.PI / 4)
  ctx.shadowColor = 'rgba(242, 67, 145, .42)'
  ctx.shadowBlur = 18

  const dropGradient = ctx.createLinearGradient(-14, -16, 14, 18)
  dropGradient.addColorStop(0, '#ffffff')
  dropGradient.addColorStop(.28, '#ffe0e9')
  dropGradient.addColorStop(.70, '#f24391')
  dropGradient.addColorStop(1, '#ff8550')

  ctx.fillStyle = dropGradient
  ctx.beginPath()
  ctx.moveTo(0, -17)
  ctx.bezierCurveTo(15, -8, 16, 12, 0, 18)
  ctx.bezierCurveTo(-16, 12, -15, -8, 0, -17)
  ctx.fill()

  ctx.shadowBlur = 0
  ctx.globalAlpha = .88
  ctx.fillStyle = 'rgba(255,255,255,.88)'
  ctx.beginPath()
  ctx.ellipse(-5, -6, 4, 8, .52, 0, Math.PI * 2)
  ctx.fill()

  ctx.globalAlpha = .72
  ctx.strokeStyle = 'rgba(255,255,255,.92)'
  ctx.lineWidth = 1.6
  ctx.beginPath()
  ctx.moveTo(-1, -12)
  ctx.bezierCurveTo(8, -5, 8, 8, 0, 13)
  ctx.stroke()
  ctx.restore()
}

watch(isOpen, async (value) => {
  if (value) {
    lockPageScroll()
    await nextTick()
    resizeCanvas()
    return
  }

  unlockPageScroll()
})

onMounted(() => {
  window.addEventListener('resize', resizeCanvas, { passive: true })
  void preloadBacteriaSprites()
})

onBeforeUnmount(() => {
  unlockPageScroll()
  stopLoop()
  window.removeEventListener('resize', resizeCanvas)
})
</script>

<template>
  <div class="micro-game" :class="{ 'micro-game_open': isOpen }">
    <button
      type="button"
      class="micro-game__tab"
      :aria-expanded="isOpen"
      aria-controls="microbiome-game-panel"
      @click="toggle"
    >
      <span class="micro-game__tab-badge">Игра</span>
      <span class="micro-game__tab-drop"></span>
      <span class="micro-game__tab-text">скидка до 15%</span>
    </button>

    <Transition name="micro-game-panel">
      <aside
        v-if="isOpen"
        id="microbiome-game-panel"
        class="micro-game__panel"
        aria-label="Игра ко Дню микробиома"
      >
        <button type="button" class="micro-game__close" aria-label="Закрыть игру" @click="close">×</button>

        <div class="micro-game__head">
          <p>{{ panelTitle }}</p>
          <h3>Капля Daigo против бактерий</h3>
        </div>

        <div class="micro-game__layout">
          <div class="micro-game__playground">
            <template v-if="!isPlaying">
              <div class="micro-game__intro">
                <img src="/logo.svg" alt="daigo logo" class="h-10 md:h-12 xl:h-16" />
                <p v-if="isRewardSubmitting" class="micro-game__status">
                  Сохраняем результат игры...
                </p>
                <p v-else-if="discountWon !== null && discountApplied" class="micro-game__status micro-game__status_success">
                  Готово! Ваша скидка {{ discountWon }}% применена.
                </p>
                <p v-else-if="discountWon !== null" class="micro-game__status">
                  Игра завершена. Ваша скидка: {{ discountWon }}%.
                </p>
                <p v-else-if="isFinished" class="micro-game__status">
                  Время вышло. Сохраняем результат.
                </p>
                <p v-else>
                  Авторизуйтесь и ловите вредные бактерии каплей Daigo. Игра длится {{ Math.round(GAME_DURATION_MS / 1000) }} секунд: чем больше вредных бактерий поймано, тем выше итоговая скидка. Полезные зелёные бактерии лучше не задевать.
                </p>

                <p v-if="gameError" class="micro-game__error">{{ gameError }}</p>

                <button v-if="discountWon === null" type="button" class="micro-game__start" @click="startGame">
                  Играть {{ Math.round(GAME_DURATION_MS / 1000) }} секунд
                </button>
                <button
                  v-else
                  type="button"
                  class="micro-game__start"
                  @click="goToCatalog"
                >
                  Перейти к товарам
                </button>
              </div>
            </template>

            <canvas
              v-show="isPlaying"
              ref="canvasRef"
              class="micro-game__canvas"
              @pointerdown="onPointerDown"
              @pointermove="onPointerMove"
              @pointerup="onPointerUp"
              @pointercancel="onPointerUp"
              @pointerleave="onPointerUp"
            />
          </div>

          <div class="micro-game__hud">
            <div class="micro-game__jar" aria-label="Заполнение баночки энергии">
              <div class="micro-game__jar-liquid" :style="{ height: `${energyPercent}%` }"></div>
              <span>{{ energyPercent }}%</span>
            </div>
            <div class="micro-game__stats">
              <p><span>Время</span><strong>{{ timeLeft }}с</strong></p>
              <p><span>Вредные</span><strong>{{ badKilled }}</strong></p>
              <p><span>Штраф</span><strong>-{{ goodTouched * GOOD_BACTERIA_PENALTY }}</strong></p>
              <p><span>Сейчас</span><strong>{{ currentDiscount }}%</strong></p>
            </div>
          </div>
        </div>

        <p class="micro-game__note">
          Расчёт прозрачный: 6 вредных бактерий — 3%, 12 — 5%, 18 — 7%, 24 — 10%, 30 — 12%, 36 и больше — 15%. Каждая задетая полезная бактерия уменьшает зачёт на 3.
        </p>
      </aside>
    </Transition>
  </div>
</template>

<style scoped>
:global(html.daigo-page-scroll-locked),
:global(body.daigo-page-scroll-locked) {
  overflow: hidden !important;
  overscroll-behavior: none;
}

:global(body.daigo-modal-open [id*="carrot"]),
:global(body.daigo-modal-open [class*="carrot"]),
:global(body.daigo-modal-open [id*="Carrot"]),
:global(body.daigo-modal-open [class*="Carrot"]),
:global(body.daigo-modal-open iframe[src*="carrot"]),
:global(body.daigo-modal-open iframe[src*="Carrot"]) {
  z-index: 1 !important;
  pointer-events: none !important;
}

.micro-game {
  --game-primary: #f24391;
  --game-primary-end: #ff8550;
  --game-primary-dark: #d9307a;
  --game-text: #111827;
  position: fixed;
  right: 0;
  top: 50%;
  z-index: 9999999998;
  transform: translateY(-50%);
  pointer-events: none;
}

.micro-game_open {
  inset: 0;
  top: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(17, 24, 39, .38);
  padding: clamp(12px, 2vw, 24px);
  transform: none;
  pointer-events: auto;
  backdrop-filter: blur(8px);
}

.micro-game__tab,
.micro-game__panel {
  pointer-events: auto;
}

.micro-game_open .micro-game__tab {
  display: none;
}

.micro-game__tab {
  position: relative;
  display: flex;
  width: 74px;
  min-height: 178px;
  cursor: pointer;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 0;
  border-radius: 18px 0 0 18px;
  background: linear-gradient(135deg, var(--game-primary) 0%, var(--game-primary-end) 100%);
  color: #fff;
  box-shadow: 0 16px 40px rgba(242, 67, 145, .30);
}

.micro-game__tab::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 30% 16%, rgba(255,255,255,.42), transparent 30%),
    linear-gradient(120deg, transparent 12%, rgba(255,255,255,.16) 34%, transparent 52%);
}

.micro-game__tab-badge,
.micro-game__tab-drop,
.micro-game__tab-text {
  position: relative;
  z-index: 1;
}

.micro-game__tab-badge {
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  text-transform: uppercase;
  letter-spacing: .16em;
  font-size: 10px;
  font-weight: 700;
}

.micro-game__tab-drop {
  position: relative;
  width: 38px;
  height: 50px;
  margin: 12px 0 9px;
  border-radius: 62% 62% 58% 0;
  background: linear-gradient(135deg, #fff 0%, #ffe0e9 34%, #ff9b78 68%, #d9307a 100%);
  box-shadow: inset 7px -7px 14px rgba(217, 48, 122, .18), 0 10px 22px rgba(0, 0, 0, .16);
  transform: rotate(-45deg);
  animation: micro-game-drop 2.6s ease-in-out infinite;
}

.micro-game__tab-drop::after {
  content: '';
  position: absolute;
  left: 8px;
  top: 9px;
  width: 10px;
  height: 18px;
  border-radius: 999px;
  background: rgba(255,255,255,.88);
  transform: rotate(18deg);
}

.micro-game__tab-text {
  max-width: 60px;
  font-size: 10px;
  line-height: 1.12;
  text-align: center;
  text-transform: lowercase;
}

.micro-game__panel {
  position: absolute;
  right: 88px;
  top: 50%;
  width: min(520px, calc(100vw - 112px));
  padding: 16px;
  border-radius: 26px;
  background: #fff;
  box-shadow: 0 28px 78px rgba(17, 24, 39, .22);
  transform: translateY(-50%);
}

.micro-game_open .micro-game__panel {
  position: relative;
  right: auto;
  top: auto;
  display: flex;
  width: min(1180px, calc(100vw - 32px));
  height: min(760px, calc(100vh - 40px));
  max-height: calc(100vh - 40px);
  flex-direction: column;
  padding: clamp(16px, 2vw, 24px);
  border: 1px solid rgba(255,255,255,.72);
  border-radius: 30px;
  background:
    radial-gradient(circle at 12% 0%, rgba(242, 67, 145, .14), transparent 28%),
    radial-gradient(circle at 88% 12%, rgba(242, 67, 145, .10), transparent 30%),
    #fff;
  transform: none;
}

.micro-game__panel::before {
  content: '';
  position: absolute;
  right: -8px;
  top: 50%;
  width: 18px;
  height: 18px;
  background: #fff;
  transform: translateY(-50%) rotate(45deg);
}

.micro-game_open .micro-game__panel::before {
  display: none;
}

.micro-game__close {
  position: absolute;
  right: 13px;
  top: 13px;
  z-index: 3;
  display: inline-flex;
  width: 36px;
  height: 36px;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 999px;
  background: rgba(242, 67, 145, .12);
  color: var(--game-primary-dark);
  font-size: 26px;
  line-height: 1;
}

.micro-game__head {
  padding-right: 48px;
}

.micro-game__head p {
  margin: 0 0 3px;
  color: var(--game-primary);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: .16em;
  text-transform: uppercase;
}

.micro-game__head h3 {
  margin: 0 0 14px;
  color: var(--game-text);
  font-size: clamp(22px, 2.3vw, 34px);
  font-weight: 600;
  line-height: 1.15;
}

.micro-game__layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 82px;
  gap: 12px;
}

.micro-game_open .micro-game__layout {
  flex: 1;
  min-height: 0;
  grid-template-columns: minmax(0, 1fr) 120px;
  gap: 18px;
}

.micro-game__playground {
  position: relative;
  min-height: 330px;
  overflow: hidden;
  border: 1px solid rgba(242, 67, 145, .18);
  border-radius: 22px;
  background:
    radial-gradient(circle at 18% 12%, rgba(242, 67, 145, .18), transparent 28%),
    radial-gradient(circle at 82% 88%, rgba(242, 67, 145, .10), transparent 30%),
    #f8fbff;
}

.micro-game_open .micro-game__playground {
  min-height: 0;
  height: 100%;
  border-radius: 28px;
}

.micro-game__canvas {
  display: block;
  width: 100%;
  height: 330px;
  touch-action: none;
}

.micro-game_open .micro-game__canvas {
  height: 100%;
}

.micro-game__intro {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 24px;
  text-align: center;
  gap: 15px;
}

.micro-game__intro p {
  max-width: 360px;
  color: rgba(17, 24, 39, .68);
  font-size: 15px;
  line-height: 1.45;
}

.micro-game__intro-drop {
  position: relative;
  width: 84px;
  height: 108px;
  margin-bottom: 20px;
  border-radius: 62% 62% 58% 0;
  background: linear-gradient(135deg, #ffffff 0%, #ffe7ef 30%, #ff9b78 62%, #d9307a 100%);
  box-shadow: inset 14px -14px 28px rgba(217, 48, 122, .18), 0 22px 42px rgba(242, 67, 145, .28);
  transform: rotate(-45deg);
}

.micro-game__intro-drop::before {
  content: '';
  position: absolute;
  left: 18px;
  top: 17px;
  width: 17px;
  height: 34px;
  border-radius: 999px;
  background: rgba(255,255,255,.86);
  transform: rotate(18deg);
}

.micro-game__intro-drop::after {
  content: '';
  position: absolute;
  right: 15px;
  bottom: 18px;
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: rgba(255,255,255,.72);
}

.micro-game__status {
  color: #45bc68 !important;
  font-weight: 500;
}

.micro-game__status_success {
  color: #166534 !important;
}

.micro-game__error {
  max-width: 420px;
  margin: 12px 0 0;
  border-radius: 14px;
  background: rgba(239, 68, 68, .10);
  padding: 10px 12px;
  color: #b91c1c !important;
  font-size: 13px !important;
  font-weight: 600;
}

.micro-game__start {
  display: inline-flex;
  min-height: 46px;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 14px;
  background: linear-gradient(135deg, var(--game-primary) 0%, var(--game-primary-end) 100%);
  padding: 12px 18px;
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  box-shadow: 0 14px 32px rgba(242, 67, 145, .24);
}

.micro-game__start:hover {
  background: linear-gradient(135deg, var(--game-primary-dark) 0%, var(--game-primary-end) 100%);
}

.micro-game__code {
  display: flex;
  width: min(280px, 100%);
  overflow: hidden;
  border: 1px solid rgba(242, 67, 145, .22);
  border-radius: 16px;
  background: #fff;
  margin: 4px 0 14px;
}

.micro-game__code span {
  flex: 1;
  padding: 12px;
  color: #263149;
  font-size: 18px;
  font-weight: 500;
  letter-spacing: .08em;
}

.micro-game__code button {
  border: 0;
  background: rgba(242, 67, 145, .12);
  padding: 0 12px;
  color: var(--game-primary-dark);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.micro-game__hud {
  display: flex;
  min-height: 330px;
  flex-direction: column;
  gap: 10px;
}

.micro-game_open .micro-game__hud {
  min-height: 0;
  height: 100%;
}

.micro-game__jar {
  position: relative;
  flex: 1;
  overflow: hidden;
  border: 2px solid rgba(242, 67, 145, .40);
  border-top-width: 10px;
  border-radius: 32px 32px 22px 22px;
  background: rgba(242, 67, 145, .05);
  box-shadow: inset 0 0 0 4px rgba(255,255,255,.75), 0 16px 36px rgba(242, 67, 145, .12);
}

.micro-game__jar-liquid {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 18px 18px 14px 14px;
  background: linear-gradient(180deg, #ffe0e9 0%, #ff9b78 48%, #f24391 100%);
  transition: height .25s ease;
}

.micro-game__jar-liquid::before {
  content: '';
  position: absolute;
  left: -15%;
  right: -15%;
  top: -9px;
  height: 18px;
  border-radius: 50%;
  background: rgba(255,255,255,.72);
  animation: micro-game-wave 2.4s linear infinite;
}

.micro-game__jar span {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #263149;
  font-size: 18px;
  font-weight: 800;
  text-shadow: 0 1px 0 rgba(255,255,255,.70);
}

.micro-game__stats {
  display: grid;
  gap: 7px;
}

.micro-game__stats p {
  margin: 0;
  border-radius: 14px;
  background: rgba(242, 67, 145, .10);
  padding: 9px 7px;
  text-align: center;
}

.micro-game__stats span,
.micro-game__stats strong {
  display: block;
}

.micro-game__stats span {
  color: rgba(17, 24, 39, .52);
  font-size: 10px;
}

.micro-game__stats strong {
  color: var(--game-text);
  font-size: 15px;
  font-weight: 800;
}

.micro-game__note {
  margin: 12px 0 0;
  color: rgba(17, 24, 39, .50);
  font-size: 12px;
  line-height: 1.35;
}

.micro-game-panel-enter-active,
.micro-game-panel-leave-active {
  transition: opacity .2s ease, transform .2s ease;
}

.micro-game-panel-enter-from,
.micro-game-panel-leave-to {
  opacity: 0;
  transform: translate(10px, -50%);
}

.micro-game_open .micro-game-panel-enter-from,
.micro-game_open .micro-game-panel-leave-to {
  transform: scale(.98);
}

@keyframes micro-game-drop {
  0%, 100% { transform: rotate(-45deg) translateY(0); }
  50% { transform: rotate(-45deg) translateY(-5px); }
}

@keyframes micro-game-wave {
  0% { transform: translateX(-8%); }
  100% { transform: translateX(8%); }
}

@media (max-width: 767px) {
  .micro-game__tab {
    width: 68px;
    min-height: 162px;
    border-radius: 16px 0 0 16px;
  }

  .micro-game_open {
    padding: 10px;
  }

  .micro-game_open .micro-game__panel {
    width: calc(100vw - 20px);
    height: calc(100vh - 20px);
    max-height: calc(100vh - 20px);
    padding: 12px;
    border-radius: 22px;
  }

  .micro-game_open .micro-game__layout {
    grid-template-columns: minmax(0, 1fr) 72px;
    gap: 8px;
  }

  .micro-game:not(.micro-game_open) .micro-game__panel {
    right: 80px;
    width: min(390px, calc(100vw - 96px));
    padding: 12px;
    border-radius: 22px;
  }

  .micro-game:not(.micro-game_open) .micro-game__layout {
    grid-template-columns: minmax(0, 1fr) 64px;
    gap: 8px;
  }

  .micro-game:not(.micro-game_open) .micro-game__playground,
  .micro-game:not(.micro-game_open) .micro-game__hud,
  .micro-game:not(.micro-game_open) .micro-game__canvas {
    min-height: 292px;
    height: 292px;
  }

  .micro-game__head h3 {
    font-size: 18px;
  }
}

@media (max-width: 430px) {
  .micro-game__tab {
    width: 58px;
    min-height: 142px;
  }

  .micro-game__tab-drop {
    width: 30px;
    height: 40px;
  }

  .micro-game__tab-text {
    max-width: 48px;
    font-size: 9px;
  }

  .micro-game:not(.micro-game_open) .micro-game__panel {
    right: 66px;
    width: calc(100vw - 78px);
  }

  .micro-game_open .micro-game__layout {
    grid-template-columns: minmax(0, 1fr) 58px;
  }

  .micro-game__stats p {
    padding: 7px 4px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .micro-game__tab-drop,
  .micro-game__jar-liquid::before {
    animation: none;
  }

  .micro-game-panel-enter-active,
  .micro-game-panel-leave-active {
    transition: none;
  }
}
</style>
