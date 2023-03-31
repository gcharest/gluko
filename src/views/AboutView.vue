<template>
  <main class="about container">
    <h1 class="text-light">{{ $t("about") }}</h1>
    <p class="text-light">
      {{ $t("aboutText.para1") }}
    </p>
    <p class="text-light">
      {{ $t("aboutText.para2") }}
    </p>
    <p class="text-light">
      {{ $t("aboutText.para3") }}
      <a :href="$t('aboutText.url')">{{ $t("aboutText.CNF") }}</a>
    </p>
  </main>
</template>
