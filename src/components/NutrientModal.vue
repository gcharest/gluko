<script setup lang="ts">
import { useMealStore } from "@/stores/meal";
import { ref, Teleport } from "vue";
const props = defineProps({
  nutrientName: { type: String, required: true },
  nutrientID: { type: Number, required: true },
});
const store = useMealStore();
const nutrient = ref(
  store.nutrients.find((nutrient) => nutrient.name === props.nutrientName)
);
const modalId = () => "modal" + props.nutrientID.toString();
const modalIdTarget = "#" + modalId();
const modalLabel = "modalLabel" + modalId();
</script>

<script lang></script>
<template>
  <div>
    <button
      type="button"
      class="btn btn-primary"
      data-bs-toggle="modal"
      :data-bs-target="modalIdTarget"
    >
      {{ $t("Modify") }}
    </button>
    <Teleport to="body">
      <div
        class="modal modal-fullscreen-md-down fade"
        :id="modalId()"
        tabindex="-1"
        :aria-labelledby="modalLabel"
        aria-hidden="true"
      >
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" :id="modalLabel">
                {{ nutrient?.name }}
              </h5>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div class="modal-body">
              <div class="row g-3">
                <div class="col form-floating">
                  <input
                    type="text"
                    class="form-control text-black"
                    v-if="nutrient?.name !== undefined"
                    v-model.lazy="nutrient.name"
                    :placeholder="nutrient.name"
                    :id="'nutrientName' + nutrientID"
                    onclick="select()"
                  />
                  <label class="text-dark" :for="'nutrientName' + nutrientID">{{
                    $t("Nom de l'aliment")
                  }}</label>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Close
              </button>
              <button type="button" class="btn btn-primary">
                Save changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
