<script setup lang="ts">
import CarbFactorSearch from '@/components/CarbFactorSearch.vue'
</script>

<template>
  <div class="container">
    <h1>{{ $t('navigation.carbFactor') }}</h1>
    <p>{{ $t('notices.experimental.display') }}</p>
    <CarbFactorSearch />
  </div>
</template>
  