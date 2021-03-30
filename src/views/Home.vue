<template>
  <div class="home">
    <h1>Calcul des glucides</h1>
    <Calculator />
    <MealList />
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import Calculator from "@/components/Calculator.vue";
import MealList from "@/components/MealList.vue";

@Options({
  components: {
    Calculator,
    MealList
  }
})
export default class Home extends Vue {}
</script>
