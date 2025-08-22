<script setup lang="ts">
import BaseContainer from '~/components/layout/BaseContainer.vue'
import ProfileField from '~/components/profile/ProfileField.vue'
import AddressDropdown from '~/components/profile/AddressDropdown.vue'
import { useUserStore } from '@/stores/userStore'
import { useAuthStore } from '@/stores/authStore'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { navigateTo } from '#imports'

definePageMeta({ layout: 'main' })

const userStore = useUserStore()
const authStore = useAuthStore()
await userStore.load()

const { profile } = storeToRefs(userStore)

const fullName = computed(() =>
  profile.value ? `${profile.value.first_name} ${profile.value.last_name}` : ''
)

const cardImage = computed(() =>
  profile.value?.loyalty_status
    ? `/images/profile/${profile.value.loyalty_status}.webp`
    : ''
)

function logout() {
  authStore.logout()
  navigateTo('/')
}

function formatDate(date?: string | null) {
  if (!date) return ''
  const [y, m, d] = date.split('-')
  return `${d}.${m}.${y}`
}

function updateField(field: string, value: string) {
  userStore.saveProfile({ [field]: value })
}

function saveAddress(index: number, address: any) {
  if (!profile.value) return
  const newAddresses = [...profile.value.addresses]
  newAddresses[index] = address
  userStore.saveProfile({ addresses: newAddresses })
}

function deleteAddress(index: number) {
  if (!profile.value) return
  const newAddresses = [...profile.value.addresses]
  newAddresses.splice(index, 1)
  userStore.saveProfile({ addresses: newAddresses })
}
</script>

<template>
  <BaseContainer>
    <section v-if="profile" class="w-full py-10 relative">
      <NuxtLink to="/" class="inline-flex gap-2 mb-4 text-lg"><img src="/icons/arrow-right-pag.svg" class="w-2 rotate-180" /> Вернуться назад</NuxtLink>

      <div class="w-full flex felx-row items-center justify-between gap-8 mb-6">
        <h1 class="text-[clamp(2.8rem,6vw,4.8rem)] font-medium">Личный кабинет</h1>

        <div class="text-xl pb-1 border-b cursor-pointer" @click="logout">
          Выйти из профиля
        </div>
      </div>

      <!-- Loyalty Card -->
      <div class="w-full max-w-[48%] rounded-xl overflow-hidden mb-8">
        <img :src="cardImage" alt="Карта лояльности" class="w-full h-auto" />
      </div>

      <!-- Bonuses Block -->
      <div class="relative bg-primary/10 text-lg rounded-xl px-4 py-3 mb-6 flex flex-col gap-3 items-start justify-start max-w-[70%]">
        <div class="flex flex-row gap-2 ">
          <img src="/icons/bi_stars.svg" class="w-6" /> Количество бонусов: <span class="text-primary font-medium">{{ profile.bonuses.valid.value }}</span><br />
        </div>
        <span v-if="profile.bonuses.expiring.value > 0" class="text-sm">
          {{ profile.bonuses.expiring.value }} бонусов сгорят {{ formatDate(profile.bonuses.expiring.date_end) }}
        </span>
        <div class="absolute right-4 top-3 text-xl mb-auto mt-1"><img src="/icons/arrow-primary.svg" class="w-4" /></div>
      </div>

      <!-- Bank Cards -->
      <div class="bg-gray-100 rounded-xl p-4 mb-6 max-w-[70%]">
        <div class="text-base font-medium mb-4">Банковские карты</div>
          <div class="flex flex-row items-center w-full max-w-[70%] mb-6">
            <div class="relative w-[60%] h-[90px]">
              <template v-if="profile.cards && profile.cards.length">
                <div 
                  v-for="(card, index) in profile.cards" 
                  :key="card.card_number"
                  class="absolute transition-all duration-300 ease-in-out group"
                  :style="{ zIndex: profile.cards.length - index, transform: `translateX(${index * 30}px)` }"
                >
                  <div 
                    class="w-full h-[90px] bg-cover bg-center p-2 flex flex-col justify-end rounded-lg shadow-lg transition-all duration-300 ease-in-out"
                    :class="index !== 0 ? 'group-hover:translate-x-4' : ''"
                    style="background-image: linear-gradient(31deg, #659cff, #a6c6ff);"
                  >
                    <span class="text-xs text-white/70">{{ card.issuer_name }} — {{ card.card_type.toUpperCase() }} {{ card.expiry_date }}</span>
                    <span class="text-white text-xs xs:text-[10px] mt-auto mb-1 font-medium xs:font-normal">
                      **** **** **** {{ card.card_number }}
                    </span>
                    <div class="flex flex-row items-center justify-between">
                      <span class="text-white text-xs xs:text-[10px]">{{ card.expiry_date }}</span>
                      <span class="text-white text-xs xs:text-[10px]">{{ card.cvc || '***' }}</span>
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </div>
      </div>

      <!-- Editable Fields -->
      <div class="flex flex-col gap-4 text-sm max-w-[70%]">
        <ProfileField
          v-for="(value, field) in {
            first_name: profile.first_name,
            last_name: profile.last_name,
            phone_number: profile.phone_number,
            email: profile.email,
            birth_day: profile.birth_day
          }"
          :key="field"
          :label="field"
          :value="value"
          :field="field"
          @save="updateField"
        />
      </div>

      <!-- Addresses Dropdown -->
      <div class="mt-6 max-w-[70%]">
        <AddressDropdown
          :addresses="profile.addresses"
          @save="saveAddress"
          @delete="deleteAddress"
        />
      </div>
    </section>
  </BaseContainer>
</template>
