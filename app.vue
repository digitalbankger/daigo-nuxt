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
    },
    {
      key: 'yandex-metrika',
      type: 'text/javascript',
      children:
        `(function(m,e,t,r,i,k,a){` +
        `m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};` +
        `m[i].l=1*new Date();` +
        `for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}` +
        `k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)` +
        `})(window, document,'script','https://mc.yandex.ru/metrika/tag.js', 'ym');` +
        `ym(31773751, 'init', {` +
        `webvisor:true, clickmap:true, ecommerce:"dataLayer", referrer: document.referrer, url: location.href,` +
        `accurateTrackBounce:true, trackLinks:true` +
        `});`
    }
  ]
})
</script>

<template>
  <NuxtLayout />
</template>
