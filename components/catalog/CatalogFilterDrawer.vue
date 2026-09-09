<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted } from 'vue'
import { useBodyScrollLock } from '~/composables/useBodyScrollLock'
import type { FilterGroup } from '~/types/filter'

const props = defineProps<{
  show: boolean
  store: {
    filters: FilterGroup[]
    counts: Record<string, number>
    fetchCounts: (baseQuery?: Record<string, string[]>) => void | Promise<void>
  }
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const shouldLockBody = computed(() => props.show)
useBodyScrollLock(shouldLockBody)

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && props.show) emit('close')
}

onMounted(() => document.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown))
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200 ease-out"
      leave-active-class="transition-opacity duration-200 ease-in"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <button
        v-if="show"
        type="button"
        aria-label="Закрыть фильтры"
        class="fixed inset-0 z-[110] cursor-default bg-black/30 lg:hidden"
        @click="emit('close')"
      />
    </Transition>

    <Transition
      enter-active-class="transition-transform duration-200 ease-out"
      leave-active-class="transition-transform duration-200 ease-in"
      enter-from-class="translate-y-full"
      leave-to-class="translate-y-full"
    >
      <section
        v-if="show"
        role="dialog"
        aria-modal="true"
        aria-label="Фильтры каталога"
        class="fixed inset-x-0 bottom-0 z-[120] h-[70dvh] max-h-[70dvh] rounded-t-[28px] border-t border-black/10 bg-white shadow-2xl lg:hidden"
      >
        <div class="h-full overflow-y-auto px-3 pb-[calc(18px+env(safe-area-inset-bottom))] pt-4 sm:px-5">
          <div class="sticky top-0 z-10 mb-2 flex items-center justify-between">
            <button
              type="button"
              aria-label="Закрыть фильтры"
              class="ms-auto inline-flex h-10 w-10 items-center justify-center rounded-full bg-hoverbtn text-black transition hover:bg-black/10"
              @click="emit('close')"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
              </svg>
            </button>
          </div>

          <LazyCatalogFilterPanel :store="store" />
        </div>
      </section>
    </Transition>
  </Teleport>
</template>
