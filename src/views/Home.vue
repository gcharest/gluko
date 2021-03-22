<template>
  <div class="home">
    <h1>Calcul des glucides</h1>
    <Calculator />
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import Calculator from "@/components/Calculator.vue"; // @ is an alias to /src

@Options({
  components: {
    Calculator
  }
})
export default class Home extends Vue {}
</script>
