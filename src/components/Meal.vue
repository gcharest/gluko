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
  </div>
</template>
<script>
import { computed, defineComponent } from "@vue/runtime-core";
import { useStore } from "@/store/index";

export default defineComponent({
  setup() {
    const store = useStore();
    const nutrients = computed(() => store.state);
    return {};
  }
});
</script>
