<script setup lang="ts">
import { useMealStore } from "@/stores/meal";
import { ref } from "vue";
// import type { Ref } from "vue";
const props = defineProps({
  nutrientName: { type: String, required: true },
  index: { type: Number, required: true },
  nutrient: { type: Object, required: true },
  saveNutrient: { type: Function, required: true },
});
const store = useMealStore();

let localNutrient = ref({
  id: props.nutrient.id,
  name: props.nutrient.name,
  quantity: props.nutrient.quantity,
  factor: props.nutrient.factor,
});
const modalId = () => "modal" + props.index.toString();
const modalIdTarget = () => {
  return "#" + modalId();
};
const modalLabel = () => {
  return "modalLabel" + modalId();
};

const saveNutrient = () => {
  store.updateNutrient(localNutrient.value);
};
const resetNutrient = () => {
  localNutrient.value = props.nutrient.value;
  // store.updateNutrient(localNutrient.value);
};
</script>

<script lang></script>
<template>
  <div class="row">
    <button
      type="button"
      class="btn btn-primary p-lg-2 lg-3 m-2 mx-3"
      data-bs-toggle="modal"
      :data-bs-target="modalIdTarget()"
    >
      {{ $t("Modify") }}
    </button>
    <Teleport to="body">
      <div
        class="modal modal-fullscreen-md-down fade"
        :id="modalId()"
        tabindex="-1"
        :aria-labelledby="modalLabel()"
        aria-hidden="true"
      >
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" :id="modalLabel()">
                {{ localNutrient.name }}
              </h5>
            </div>
            <div class="modal-body">
              <div class="row g-3" v-if="localNutrient.name !== undefined">
                <div class="col form-floating">
                  <input
                    type="text"
                    class="form-control text-black"
                    v-model="localNutrient.name"
                    :placeholder="localNutrient.name"
                    :id="'nutrientName' + props.index"
                    onclick="select()"
                  />
                  <label
                    class="text-dark"
                    :for="'nutrientName' + props.index"
                    >{{ $t("Nom de l'aliment") }}</label
                  >
                </div>
                <div class="col form-floating mb-3">
                  <input
                    type="text"
                    class="form-control"
                    v-model="localNutrient.quantity"
                    :placeholder="localNutrient.quantity.toString()"
                    :id="'nutrientQuantity' + props.index"
                    onclick="select()"
                  />
                  <label :for="'nutrientQuantity' + props.index">{{
                    $t("Quantité")
                  }}</label>
                </div>
                <div class="col form-floating mb-3 lg">
                  <input
                    type="number"
                    class="form-control"
                    v-model="localNutrient.factor"
                    :placeholder="localNutrient.factor.toString()"
                    :id="'nutrientFactor' + props.index"
                    onclick="select()"
                  />
                  <label :for="'nutrientFactor' + props.index">{{
                    $t("Facteur")
                  }}</label>
                  <p class="text-light">
                    {{ localNutrient.quantity * localNutrient.factor }} g
                  </p>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                data-bs-dismiss="modal"
                @click="resetNutrient()"
              >
                {{ $t("Close") }}
              </button>
              <button
                type="button"
                class="btn btn-primary"
                data-bs-dismiss="modal"
                @click="saveNutrient()"
              >
                {{ $t("Save Changes") }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
