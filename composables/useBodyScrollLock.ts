import { onBeforeUnmount, watch, type Ref } from 'vue'

let lockCounter = 0
let savedScrollY = 0
let savedBodyStyle: Partial<CSSStyleDeclaration> | null = null

function lockBody() {
  if (!process.client) return

  lockCounter += 1
  if (lockCounter > 1) return

  savedScrollY = window.scrollY || window.pageYOffset || 0
  const body = document.body

  savedBodyStyle = {
    position: body.style.position,
    top: body.style.top,
    left: body.style.left,
    right: body.style.right,
    width: body.style.width,
    overflow: body.style.overflow,
    paddingRight: body.style.paddingRight,
  }

  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth

  body.style.position = 'fixed'
  body.style.top = `-${savedScrollY}px`
  body.style.left = '0'
  body.style.right = '0'
  body.style.width = '100%'
  body.style.overflow = 'hidden'

  if (scrollbarWidth > 0) {
    body.style.paddingRight = `${scrollbarWidth}px`
  }
}

function unlockBody() {
  if (!process.client || lockCounter <= 0) return

  lockCounter -= 1
  if (lockCounter > 0) return

  const body = document.body
  const restore = savedBodyStyle || {}

  body.style.position = restore.position || ''
  body.style.top = restore.top || ''
  body.style.left = restore.left || ''
  body.style.right = restore.right || ''
  body.style.width = restore.width || ''
  body.style.overflow = restore.overflow || ''
  body.style.paddingRight = restore.paddingRight || ''

  window.scrollTo(0, savedScrollY)
  savedBodyStyle = null
  savedScrollY = 0
}

export function useBodyScrollLock(isLocked: Ref<boolean>) {
  let active = false

  const stop = watch(
    isLocked,
    (value) => {
      if (!process.client) return

      if (value && !active) {
        lockBody()
        active = true
        return
      }

      if (!value && active) {
        unlockBody()
        active = false
      }
    },
    { immediate: true }
  )

  onBeforeUnmount(() => {
    stop()
    if (active) {
      unlockBody()
      active = false
    }
  })
}
