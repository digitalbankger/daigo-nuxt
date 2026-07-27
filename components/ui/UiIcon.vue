<script setup lang="ts">
import { computed } from 'vue'
type IconName =
  | 'arrow-left'
  | 'arrow-right'
  | 'box'
  | 'chevron-down'
  | 'clock'
  | 'map-pin'
  | 'shop'
  | 'truck'
  | 'delivery-courier'
  | 'delivery-pvz'
  | 'delivery-pickup'

const props = withDefaults(defineProps<{
  name: IconName
  size?: number | string
  strokeWidth?: number | string
}>(), {
  size: 24,
  strokeWidth: 1.7,
})

const isDeliveryIcon = computed(() => [
  'delivery-courier',
  'delivery-pvz',
  'delivery-pickup',
].includes(props.name))

const iconViewBox = computed(() =>
  isDeliveryIcon.value ? '0 0 200 200' : '0 0 24 24',
)
</script>

<template>
  <svg
    :width="size"
    :height="size"
    :viewBox="iconViewBox"
    fill="none"
    :stroke="isDeliveryIcon ? 'none' : 'currentColor'"
    :stroke-width="strokeWidth"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <template v-if="name === 'delivery-courier'">
      <path
        fill="currentColor"
        stroke="none"
        d="M36.5 16h131q7.39 2.11 11.5 7.5l4 10v130q-1.89 8.61-7.5 13.5l-8 4h-18q-3.5-1-2.5-6.5l2.5-2.5h15l7.5-5.5 1-2v-132l-2-4.5-5.5-3H120v33.5l-2.5 2.5h-35L80 58.5V25H39.5L36 27.5l1 6 51 68 4 6v4l-27.5 27.5h-4L29.5 115H27v49.5l5.5 6.5 3 1h27l2.5 2.5 1 3-1 2.5-2.5 1.5h-30L22 174.5l-5-11v-49q1.37-6.13 6.5-8.5l5-1 7 3 27 20L81 108.5l-53-72q-2.67-3.83-1-12l6.5-7.5 3-1Z"
      />
      <path
        fill="currentColor"
        stroke="none"
        d="M100.5 119h11l12 3 31 15 3.5 3.5q1.5 8-3.5 9.5h-5l-17-5H128l6 37.5-5.5 7.5-4 1h-28l-8-3-2.5-2.5-15-33v-4l29.5-29.5Z"
      />
    </template>
    <template v-else-if="name === 'delivery-pvz'">
      <path
        fill="currentColor"
        stroke="none"
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="
          M75 2
          C35.2 2 3 34.2 3 74
          C3 109.4 43.8 155.8 63.8 172.6
          C70.3 178.1 79.7 178.1 86.2 172.6
          C106.2 155.8 147 109.4 147 74
          C147 34.2 114.8 2 75 2
          Z

          M75 48
          C60.6 48 49 59.6 49 74
          C49 88.4 60.6 100 75 100
          C89.4 100 101 88.4 101 74
          C101 59.6 89.4 48 75 48
          Z
        "
      />

      <path
        d="M172 6V22"
        fill="none"
        stroke="currentColor"
        stroke-width="9"
        stroke-linecap="round"
      />

      <path
        d="
          M172 53
          V92
          C172 103.5 176.1 108.3 185.2 114.9
          C197.1 123.5 184.5 128.6 162.5 133.2
          C143.1 137.3 140.6 145.7 152.1 154
          C160.9 160.4 181.2 162 191.1 169.4
          C205.7 180.2 190.4 187 173 189.4
          C145.2 193.2 103.9 194 66 194
        "
        fill="none"
        stroke="currentColor"
        stroke-width="9"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </template>
    <template v-else-if="name === 'delivery-pickup'">
      <path
        d="M46 189 38 193.5H6.5V74L100 6l93.5 68v119.5H162"
        fill="none"
        stroke="currentColor"
        stroke-width="9"
        stroke-linecap="round"
        stroke-linejoin="round"
      />

      <path
        d="M84.5 64h30a5 5 0 0 1 0 10h-30a5 5 0 0 1 0-10Z"
        fill="currentColor"
        stroke="none"
      />

      <path
        fill="currentColor"
        stroke="none"
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="
          M40 93h120a7 7 0 0 1 7 7v89H33v-89a7 7 0 0 1 7-7Z

          M64 142h7v7a3 3 0 0 0 3 3h5a3 3 0 0 0 3-3v-7h6a7 7 0 0 1 7 7v24a7 7 0 0 1-7 7H64a7 7 0 0 1-7-7v-24a7 7 0 0 1 7-7Z

          M111 142h7v7a3 3 0 0 0 3 3h5a3 3 0 0 0 3-3v-7h6a7 7 0 0 1 7 7v24a7 7 0 0 1-7 7h-24a7 7 0 0 1-7-7v-24a7 7 0 0 1 7-7Z
        "
      />
    </template>
    <template v-else-if="name === 'truck'">
      <path d="M3 6.5h11v10H3z" />
      <path d="M14 10h3.5l3 3v3.5H14z" />
      <circle cx="7" cy="18" r="1.75" />
      <circle cx="17.5" cy="18" r="1.75" />
    </template>

    <template v-else-if="name === 'map-pin'">
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </template>

    <template v-else-if="name === 'shop'">
      <path d="M4 10v10h16V10" />
      <path d="M3 4h18l-1 6a3 3 0 0 1-4.5 2.6A3 3 0 0 1 12 13a3 3 0 0 1-3.5-.4A3 3 0 0 1 4 10Z" />
      <path d="M9 20v-5h6v5" />
    </template>

    <template v-else-if="name === 'chevron-down'">
      <path d="m6 9 6 6 6-6" />
    </template>

    <template v-else-if="name === 'clock'">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </template>

    <template v-else-if="name === 'box'">
      <path d="m4 7 8-4 8 4-8 4Z" />
      <path d="m4 7 8 4 8-4v10l-8 4-8-4Z" />
      <path d="M12 11v10" />
    </template>

    <template v-else-if="name === 'arrow-right'">
      <path d="M5 12h14" />
      <path d="m14 7 5 5-5 5" />
    </template>

    <template v-else-if="name === 'arrow-left'">
      <path d="M19 12H5" />
      <path d="m10 7-5 5 5 5" />
    </template>
  </svg>
</template>
