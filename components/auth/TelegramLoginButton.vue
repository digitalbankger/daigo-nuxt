<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

const props = defineProps<{
  botName: string              
  size?: 'large' | 'medium' | 'small'
  radius?: number
  requestAccess?: 'write' | ''
  disabled?: boolean
}>()

const holder = ref<HTMLElement | null>(null)

function renderWidget() {
  if (!holder.value) return
  holder.value.innerHTML = ''

  const script = document.createElement('script')
  script.async = true
  script.src = 'https://telegram.org/js/telegram-widget.js?22'
  script.setAttribute('data-telegram-login', props.botName)
  script.setAttribute('data-size', props.size ?? 'medium')
  script.setAttribute('data-radius', String(props.radius ?? 8))
  script.setAttribute('data-onauth', 'onTelegramAuth(user)')
  script.setAttribute('data-request-access', props.requestAccess ?? 'write')

  holder.value.appendChild(script)
}

onMounted(() => {
  renderWidget()
})

watch(
  () => [props.botName, props.size, props.radius, props.requestAccess],
  () => renderWidget()
)
</script>

<template>
  <div class="relative">
    <div ref="holder" />

    <div
      v-if="disabled"
      class="absolute inset-0 cursor-not-allowed rounded-xl"
      title="Сначала согласитесь с условиями"
      style="background: rgba(255,255,255,0.6)"
    />
  </div>
</template>
