<template>
  <div class="home">
    <h1>Calcul des glucides</h1>
    <Calculator />
    <NutrientList />
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import Calculator from "@/components/Calculator.vue";
import NutrientList from "@/components/NutrientList.vue";

@Options({
  components: {
    Calculator,
    NutrientList
  }
})
export default class Home extends Vue {}
</script>
