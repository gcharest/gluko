<template>
  <div class="about container">
    <h1>{{ $t('navigation.about') }}</h1>
    <p>
      {{ $t('aboutText.para1') }}
    </p>
    <p>
      {{ $t('aboutText.para2') }}
    </p>
    <p>
      {{ $t('aboutText.para3') }}
      <a :href="$t('aboutText.url')">{{ $t('aboutText.CNF') }}</a>
    </p>
  </div>
</template>
