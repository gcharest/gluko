<template>
  <div class="about">
    <h1>This is an about page</h1>
    <Calculator />
  </div>
</template>
<script lang="ts">
import { Options, Vue } from "vue-class-component";
import Calculator from "@/components/Calculator.vue";

@Options({
  components: {
    Calculator
  }
})
export default class About extends Vue {}
</script>
