<script setup lang="ts">
import { ref, computed, onBeforeMount } from "vue";
import { useNutrientFileStore } from "@/stores/nutrientsFile";
const store = useNutrientFileStore();
onBeforeMount(() => {
  if (store.nutrientsFile.length === 0) {
    store.$reset();
  }
});
const search = ref("");
const searchResults = computed(() => {
  return store.searchNutrients(search.value);
});
const cnfLink = computed(() => (foodID: number, locale: string) => {
  return `https://food-nutrition.canada.ca/cnf-fce/serving-portion?id=${foodID}&lang=${
    locale === "fr" ? "fre" : "eng"
  }`;
});
</script>
<template>
  <div class="container">
    <h2>{{ $t("Search a nutrient") }}</h2>
    <div class="row text-light">
      <div class="col">
        <input
          type="text"
          class="form-control"
          :placeholder="$t('Search a nutrient')"
          v-model.lazy="search"
        />
      </div>
      <div>
        <h2>
          {{ $t("Results")
          }}<span v-if="searchResults.length > 0">
            ({{ searchResults.length }})</span
          >
        </h2>
        <ul
          class="list-group bg-dark"
          v-if="searchResults !== undefined && searchResults.length > 0"
        >
          <li class="list-group-item">
            <div class="row">
              <div class="col-8 display-6">{{ $t("Nutrient") }}</div>
              <div class="col-4 display-6 text-center">{{ $t("Facteur") }}</div>
            </div>
          </li>
          <li
            class="list-group-item"
            v-for="result in searchResults"
            :key="result.refIndex"
          >
            <div class="row">
              <div class="col-8">
                <p>
                  <span v-if="$i18n.locale === 'fr'">{{
                    result.item.FoodDescriptionF
                  }}</span>
                  <span v-else>{{ result.item.FoodDescription }}</span>
                  <a
                    :href="cnfLink(result.item.FoodID, $i18n.locale)"
                    target="_blank"
                    class="link-primary small"
                  >
                    Source <i class="bi bi-box-arrow-up-right" />
                  </a>
                </p>
              </div>
              <div class="col-4">
                <p class="text-center">
                  {{
                    result.item.FctGluc !== null
                      ? result.item.FctGluc.toFixed(2)
                      : 0
                  }}
                </p>
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
</template>
