<script setup lang="ts">
import CarbFactorSearch from "@/components/CarbFactorSearch.vue";
</script>

<template>
  <div class="container text-light">
    <h1>{{ $t("carbFactor") }}</h1>
    <p>{{ $t("Experimental") }}</p>
    <CarbFactorSearch />
  </div>
</template>
