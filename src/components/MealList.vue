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
        <tr></tr>
      </tbody>
    </table>
    <!-- Button trigger modal -->
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
import { computed, defineComponent } from "@vue/runtime-core";
import { useStore } from "@/store/index";

export default defineComponent({
  setup() {
    const store = useStore();
    //const state = computed(() => store.state);
    const profileCount = computed(() => store.getters.totalProfilesCount);
    return { profileCount };
  }
});
</script>
