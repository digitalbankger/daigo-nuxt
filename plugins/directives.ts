import { defineNuxtPlugin } from '#app'
import intersection from '~/directives/intersection'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('intersection', intersection)
})
