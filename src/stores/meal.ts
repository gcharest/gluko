import { defineStore } from "pinia";
import { useSessionStorage } from "@vueuse/core";

interface Nutrient {
  name: string;
  quantity: number;
  factor: number;
}

export const useMealStore = defineStore({
  id: "meal",
  state: () => ({
    nutrients: useSessionStorage("nutrients", [
      { name: "", quantity: 0, factor: 0 },
    ]),
  }),
  getters: {
    getAllNutrients(): Nutrient[] {
      return this.nutrients;
    },
    nutrientEmpty(): boolean {
      return this.nutrients.length <= 0;
    },
    mealCarbs(): number {
      const totalCarbs = 0;
      return this.nutrients.reduce((totalCarbs, nutrient) => {
        return totalCarbs + nutrient.quantity * nutrient.factor;
      }, totalCarbs);
    },
  },
  actions: {
    addNutrient(nutrient: Nutrient) {
      this.nutrients.push(nutrient);
    },
    removeNutrient(index: number) {
      this.nutrients.splice(index, 1);
    },
    resetMeal() {
      this.nutrients = [{ name: "", quantity: 0, factor: 0 }];
    },
  },
});
