//A modal to search for nutrients in the database and proivde the user with the
option to select one in the list.
<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from "vue";
import { useNutrientFileStore } from "@/stores/nutrientsFile";
const props = defineProps({
  searchTerm: { type: String, required: true },
});
const emit = defineEmits(["selectNutrient"]);
const store = useNutrientFileStore();
onBeforeUnmount(() => {
  if (store.nutrientsFile.length === 0) {
    store.$reset();
  }
});
const search = ref("");
const searchResults = computed(() => {
  return store.searchNutrients(search.value);
});
</script>
<template>
  <Teleport to="body">
    <div
      class="modal modal-fullscreen-md-down fade"
      id="nutrient-search-modal"
      tabindex="-1"
      aria-labelledby="nutrient-search-modal"
      aria-hidden="true"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <div class="modal-title display-6">Search for a nutrient</div>
          </div>
          <div class="modal-body">
            <div class="row">
              <div class="col">
                <ul class="list-group">
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
                        </p>
                      </div>
                      <div class="col-4">
                        <p class="text-center">
                          {{
                            result.item.FctGluc !== null
                              ? result.item.FctGluc.toFixed(2)
                              : (result.item["205"] / 100).toFixed(2)
                          }}
                        </p>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
