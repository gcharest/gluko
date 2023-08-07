<script setup lang="ts">
import CarbFactorSearch from '@/components/CarbFactorSearch.vue'
</script>

<template>
  <div class="container">
    <h1>{{ $t('carb-factor') }}</h1>
    <p>{{ $t('experimental') }}</p>
    <CarbFactorSearch />
  </div>
</template>
