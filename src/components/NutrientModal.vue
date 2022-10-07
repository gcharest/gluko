<script setup lang="ts">
import { useMealStore } from "@/stores/meal";
import { ref } from "vue";
const props = defineProps({
  nutrientName: { type: String, required: false },
  nutrientIndex: { type: Number, required: true },
});
const store = useMealStore();
let nutrient = ref(
  store.nutrients.find((nutrient) => nutrient.name === props.nutrientName)
);
if (nutrient.value === undefined) {
  nutrient.value = {
    id: Number.parseInt(crypto.randomUUID()),
    name: "",
    quantity: 0,
    factor: 0,
  };
}
let name = "";
let quantity = 0;
let factor = 0;
const modalId = () => "modal" + props.nutrientIndex.toString();
const modalIdTarget = "#" + modalId();
const modalLabel = "modalLabel" + modalId();
const saveNutrient = (name: string, quantity: number, factor: number) => {};
</script>

<script lang></script>
<template>
  <div class="row">
    <button
      type="button"
      class="btn btn-primary p-lg-2 lg-3 m-2 mx-3"
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
              <div class="row g-3" v-if="nutrient?.name !== undefined">
                <div class="col form-floating">
                  <input
                    type="text"
                    class="form-control text-black"
                    v-model.lazy="name"
                    :placeholder="nutrient.name"
                    :id="'nutrientName' + nutrientIndex"
                    onclick="select()"
                  />
                  <label
                    class="text-dark"
                    :for="'nutrientName' + nutrientIndex"
                    >{{ $t("Nom de l'aliment") }}</label
                  >
                </div>
                <div class="col form-floating mb-3">
                  <input
                    type="text"
                    class="form-control"
                    v-model="nutrient.quantity"
                    :placeholder="nutrient.quantity.toString()"
                    :id="'nutrientQuantity' + nutrientIndex"
                    onclick="select()"
                  />
                  <label :for="'nutrientQuantity' + nutrientIndex">{{
                    $t("Quantité")
                  }}</label>
                </div>
                <div class="col form-floating mb-3 lg">
                  <input
                    type="text"
                    class="form-control"
                    v-model="nutrient.factor"
                    :placeholder="nutrient.factor.toString()"
                    :id="'nutrientFactor' + nutrientIndex"
                    onclick="select()"
                  />
                  <label :for="'nutrientFactor' + nutrientIndex">{{
                    $t("Facteur")
                  }}</label>
                  <p class="text-light">
                    {{ nutrient.quantity * nutrient.factor }} g
                  </p>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                {{ $t("Close") }}
              </button>
              <button type="button" class="btn btn-primary">
                {{ $t("Save Changes") }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
