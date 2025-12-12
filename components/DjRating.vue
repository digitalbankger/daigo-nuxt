<script setup>
import { onMounted } from "vue";

onMounted(() => {
  const container = document.querySelector("[data-id='wg-dj-2604']");
  if (!container) return;

  fetch("https://dreamjob.ru/widget/get-widget?id=2604")
    .then(r => r.text())
    .then(html => {
      container.innerHTML = html;
    });
});
</script>

<template>
  <div class="dj-rating-wrapper">
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Roboto:wght@100;300;400;500;700;900&display=swap"
    />

    <a
      href="https://dreamjob.ru/employers/5699657"
      target="_blank"
      rel="noopener"
      style="text-decoration: none; color: inherit;"
      alt="Метабиотик отзывы сотрудников о работодателе на Dream Job"
    >
      <div data-id="wg-dj-2604"></div>
    </a>
  </div>
</template>
