<script setup lang="ts">
import Fuse from "fuse.js";
import { ref, computed, onBeforeMount } from "vue";
import { useNutrientFileStoreSetup } from "@/stores/nutrientsFile";

const store = useNutrientFileStoreSetup();
onBeforeMount(() => {
  if (store.nutrientsFile.length === 0) {
    store.$reset();
  }
});
const search = ref("");
const options = {
  keys: ["FoodDescriptionF"],
  location: 0,
  distance: 200,
  threshold: 0.4,
  isCaseSensitive: false,
  includeMatches: true,
};
const fuse = new Fuse(store.nutrientsFile, options);
const searchResults = computed(() => {
  return fuse.search(search.value);
});
</script>
<template>
  <main>
    <div class="container">
      <h2>{{ $t("Search a nutrient") }}</h2>
      <div class="row text-light">
        <div class="col-6 col-md-6">
          <input
            type="text"
            class="form-control"
            :placeholder="$t('Search a nutrient')"
            v-model.lazy="search"
          />
        </div>
        <div>
          <h2>{{ $t("Results") }}</h2>
          <ul
            class="list-group bg-dark"
            v-if="searchResults !== undefined && searchResults.length > 0"
          >
            <li
              class="list-group-item"
              v-for="result in searchResults.slice(0, 50)"
              :key="result.refIndex"
            >
              <div class="row">
                <div class="col-8">{{ result.item.FoodDescriptionF }}</div>
                <div class="col-4">
                  {{
                    result.item.FctGluc !== null
                      ? result.item.FctGluc.toFixed(2)
                      : 0
                  }}
                </div>
              </div>
            </li>
          </ul>
          <ul class="list-group bg-dark" v-else>
            <li class="list-group-item">{{ $t("No results") }}</li>
          </ul>
        </div>
      </div>
    </div>
  </main>
</template>
