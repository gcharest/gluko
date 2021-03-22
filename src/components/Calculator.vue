<template>
  <div>
    <h2>Total des glucides: {{ facteur * weight }}</h2>
    <form id="calculator1">
      <input v-model="facteur" inputmode="decimal" placeholder="facteur" />
      <input v-model="weight" inputmode="decimal" placeholder="weight" />
    </form>
  </div>
</template>
<script lang="ts">
import { Vue, Options } from "vue-class-component";
@Options({
  data() {
    return {
      facteur: 0,
      weight: 0,
      subtotal: 0,
      total: 0
    };
  },
  props: {
    msg: String
  },
  components: {}
})
export default class Calculator extends Vue {
  msg!: string;
}
</script>
