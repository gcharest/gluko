<template>
  <div>
    <table class="table table-dark">
      <thead>
        <tr>
          <th>
            {{ $t("meal.tableHeader.nutrient") }}
          </th>
          <th>
            {{ $t("meal.tableHeader.factor") }}
          </th>
          <th>
            {{ $t("meal.tableHeader.quantity") }}
          </th>
          <th>
            {{ $t("meal.tableHeader.subtotal") }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in nutrientsCount + 1" :key="row.id">
          <td>
            Row id:
            {{ row }}
          </td>
          <td></td>
          <td></td>
          <td></td>
        </tr>
      </tbody>
    </table>
    <!-- Bootstrap 5 Button trigger modal example from:
    https://getbootstrap.com/docs/5.0/components/modal/ 
    TODO: setup to modify nutrient content-->
    <button
      type="button"
      class="btn btn-primary"
      data-bs-toggle="modal"
      data-bs-target="#exampleModal"
    >
      Launch demo modal
    </button>

    <!-- Modal -->
    <div
      class="modal fade"
      id="exampleModal"
      tabindex="-1"
      aria-labelledby="exampleModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLabel">Modal title</h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            ...
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              data-bs-dismiss="modal"
            >
              Close
            </button>
            <button type="button" class="btn btn-primary">Save changes</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { defineComponent } from "@vue/runtime-core";
import { useStore } from "@/store/index";

export default defineComponent({
  setup() {
    const store = useStore();
    const nutrientsCount = store.getters.totalProfileMealNutrientsCount(1, 1);
    return { nutrientsCount };
  }
});
</script>
