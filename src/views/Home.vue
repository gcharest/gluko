<template>
  <div class="home">
    <h1>Calcul des glucides</h1>
    <Calculator />
    <Meal />
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import Calculator from "@/components/Calculator.vue";
import Meal from "@/components/Meal.vue";

@Options({
  components: {
    Calculator,
    Meal
  }
})
export default class Home extends Vue {}
</script>
