<script setup lang="ts">
import NutrientSearch from '@/components/search/NutrientSearch.vue'
</script>

<template>
  <div class="container">
    <h1>{{ $t('navigation.carbFactor') }}</h1>
    <p>{{ $t('notices.experimental.title') }}</p>
    <NutrientSearch />
  </div>
</template>