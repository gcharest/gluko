<script setup lang="ts">
import CarbFactorSearch from "@/components/CarbFactorSearch.vue";
</script>
<template>
  <main>
    <div class="container">
      <h1>{{ $t("carbFactor") }}</h1>
      <CarbFactorSearch />
    </div>
  </main>
</template>
