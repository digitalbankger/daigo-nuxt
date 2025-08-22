// components/ui/UiAddressInput.vue
<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import UiInput from './UiInput.vue'

const props = defineProps<{
  modelValue: { city: string; street: string; house: string; [key: string]: string }
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: typeof props.modelValue): void
}>()

const local = ref({ ...props.modelValue })

watch(() => props.modelValue, (val) => {
  local.value = { ...val }
})

function update(field: string, value: string) {
  local.value[field] = value
  emit('update:modelValue', { ...local.value })
}
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <UiInput
      v-model="local.value.city"
      placeholder="Город"
      @update:modelValue="(val) => update('city', val)"
    />
    <UiInput
      v-model="local.value.street"
      placeholder="Улица и дом"
      @update:modelValue="(val) => update('street', val)"
    />
    <UiInput
      v-model="local.value.apartment"
      placeholder="Квартира/Офис"
      @update:modelValue="(val) => update('apartment', val)"
    />
    <UiInput
      v-model="local.value.entrance"
      placeholder="Подъезд"
      @update:modelValue="(val) => update('entrance', val)"
    />
    <UiInput
      v-model="local.value.floor"
      placeholder="Этаж"
      @update:modelValue="(val) => update('floor', val)"
    />
    <UiInput
      v-model="local.value.intercom"
      placeholder="Домофон"
      @update:modelValue="(val) => update('intercom', val)"
    />
  </div>
</template>

<style scoped>
</style>
