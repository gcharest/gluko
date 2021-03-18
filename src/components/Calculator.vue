<template>
  <div>
    <form id="calculator">
      <input v-model="facteur" placeholder="facteur" />
    </form>
    <p>{{ facteur }}</p>
  </div>
</template>
<script lang="ts">
import { Vue, Options } from "vue-class-component";
@Options({
  data() {
    return {
      facteur: ""
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
