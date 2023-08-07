<template>
  <main class="about container">
    <h1 class="">{{ $t('about') }}</h1>
    <p class="">
      {{ $t('aboutText.para1') }}
    </p>
    <p class="">
      {{ $t('aboutText.para2') }}
    </p>
    <p class="">
      {{ $t('aboutText.para3') }}
      <a :href="$t('aboutText.url')">{{ $t('aboutText.CNF') }}</a>
    </p>
  </main>
</template>
