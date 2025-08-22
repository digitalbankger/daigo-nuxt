<script setup lang="ts">
import { ref } from 'vue'
import UiAddressInput from '@/components/ui/UiAddressInput.vue'

interface Address {
  city: string
  street: string
  apartment?: string
  entrance?: string
  floor?: string
  intercom?: string
}

const props = defineProps<{
  addresses: Address[]
}>()

const emit = defineEmits<{
  (e: 'save', index: number, address: Address): void
  (e: 'delete', index: number): void
}>()

const show = ref(false)
const editingIndex = ref<number | null>(null)
const newAddress = ref<Address>({ city: '', street: '' })

function toggle() {
  show.value = !show.value
}

function startEdit(index: number) {
  editingIndex.value = index
  newAddress.value = { ...props.addresses[index] }
}

function cancel() {
  editingIndex.value = null
}

function save(index: number) {
  emit('save', index, newAddress.value)
  editingIndex.value = null
}

function remove(index: number) {
  emit('delete', index)
}
</script>

<template>
  <div>
    <div
      class="flex items-center justify-between border border-gray-200 px-4 py-3 rounded-lg bg-hoverbtn cursor-pointer"
      @click="toggle"
    >
      Адреса
      <img
        src="/icons/arrow-right-pag.svg"
        class="w-2 transition-transform duration-300"
        :class="show ? 'rotate-180' : 'rotate-90'"
      />

    </div>

    <div v-if="show" class="mt-4 space-y-6">
      <div
        v-for="(address, index) in addresses"
        :key="index"
        class="p-4 bg-gray-50 rounded-xl border relative"
      >
        <template v-if="editingIndex === index">
          <UiAddressInput v-model="newAddress.value" />
          <div class="flex justify-end gap-2 mt-3">
            <button class="text-sm text-green-600" @click="save(index)">Сохранить</button>
            <button class="text-sm text-gray-500" @click="cancel">Отмена</button>
          </div>
        </template>

        <template v-else>
          <div class="text-sm text-gray-800">
            {{ address.city }}, {{ address.street }}
            <span v-if="address.apartment">кв. {{ address.apartment }}</span>
            <div class="text-xs text-gray-500">
              Подъезд: {{ address.entrance || '-' }}, Этаж: {{ address.floor || '-' }}, Домофон: {{ address.intercom || '-' }}
            </div>
          </div>
          <div class="absolute top-3 right-4 flex gap-2">
            <button class="text-blue-600" @click="startEdit(index)">✏️</button>
            <button class="text-red-600" @click="remove(index)">✕</button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
