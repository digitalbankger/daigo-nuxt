<script setup lang="ts">
import { COMPANY_CONTACTS } from '~/constants/company'
const config = useRuntimeConfig()
const ymCounterId = Number(config.public.ymCounterId || 0)
const clarityProjectId = String(config.public.clarityProjectId || '').trim()

const scripts: any[] = []

if (clarityProjectId) {
  scripts.push({
    key: 'microsoft-clarity',
    type: 'text/javascript',
    children:
      `(function(c,l,a,r,i,t,y){` +
      `c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};` +
      `t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;` +
      `y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);` +
      `})(window, document, "clarity", "script", ${JSON.stringify(clarityProjectId)});`
  })
}

if (ymCounterId) {
  scripts.push({
    key: 'yandex-metrika',
    type: 'text/javascript',
    children:
      `window.dataLayer=window.dataLayer||[];` +
      `(function(m,e,t,r,i,k,a){` +
      `m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};` +
      `m[i].l=1*new Date();` +
      `for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}` +
      `k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)` +
      `})(window, document,'script','https://mc.yandex.ru/metrika/tag.js', 'ym');` +
      `ym(${ymCounterId}, 'init', {` +
      `webvisor:true, clickmap:true, ecommerce:"dataLayer", referrer: document.referrer, url: location.href,` +
      `accurateTrackBounce:true, trackLinks:true` +
      `});`
  })
}


const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': 'https://daigo.ru/#organization',
  name: 'Daigo',
  legalName: 'ООО «МЕТАБИОТИК»',
  url: 'https://daigo.ru/',
  logo: {
    '@type': 'ImageObject',
    url: 'https://daigo.ru/logo.svg',
  },
  telephone: COMPANY_CONTACTS.mainPhone.schema,
  email: 'info@daigo.ru',
  address: {
    '@type': 'PostalAddress',
    postalCode: '127051',
    addressLocality: 'Москва',
    streetAddress: COMPANY_CONTACTS.address,
    addressCountry: 'RU',
  },
}

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': 'https://daigo.ru/#website',
  url: 'https://daigo.ru/',
  name: 'Daigo',
  inLanguage: 'ru-RU',
  publisher: { '@id': 'https://daigo.ru/#organization' },
}

scripts.push(
  {
    key: 'schema-organization',
    type: 'application/ld+json',
    children: JSON.stringify(organizationJsonLd),
  },
  {
    key: 'schema-website',
    type: 'application/ld+json',
    children: JSON.stringify(websiteJsonLd),
  },
)

useHead({
  meta: [
    {
      name: 'viewport',
      content: 'width=device-width, initial-scale=1, maximum-scale=1'
    }
  ],
  script: scripts
})
</script>

<template>
  <NuxtLayout />
</template>
