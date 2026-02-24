<script setup lang="ts">
const { public: { carrotId = '65310-79e35206a74ce38752218d816a' } } = useRuntimeConfig()

useHead({
  meta: [
    {
      name: 'viewport',
      content: 'width=device-width, initial-scale=1, maximum-scale=1'
    }
  ],
  script: [
    {
      key: 'carrotquest',
      type: 'text/javascript',
      children: `!function(){function t(t,e){return function(){window.carrotquestasync.push(t,arguments)}}if("undefined"==typeof carrotquest){var e=document.createElement("script");e.type="text/javascript",e.async=!0,e.src="https://cdn.carrotquest.app/api.min.js",document.getElementsByTagName("head")[0].appendChild(e),window.carrotquest={},window.carrotquestasync=[],carrotquest.settings={};for(var n=["connect","track","identify","auth","onReady","addCallback","removeCallback","trackMessageInteraction"],a=0;a<n.length;a++)carrotquest[n[a]]=t(n[a])}}(),carrotquest.connect("${carrotId}");`
    }
  ]
})
</script>

<template>
  <NuxtLayout />
</template>
