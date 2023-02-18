import { defineStore } from "pinia";
import { useSessionStorage } from "@vueuse/core";

export type Nutrient = {
  id: number;
  name: string;
  quantity: number;
  factor: number;
};

type Nutrients = Array<Nutrient>;

export const useMealStore = defineStore({
  id: "meal",
  state: () => ({
    nutrients: useSessionStorage("nutrients", [] as Nutrients),
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
    updateNutrient(nutrient: Nutrient) {
      const index = this.nutrients.findIndex((n) => n.id === nutrient.id);
      this.nutrients.splice(index, 1, nutrient);
    },

    resetMeal() {
      this.nutrients = [
        {
          id: Number.parseInt(crypto.randomUUID()),
          name: "",
          quantity: 0,
          factor: 0,
        },
      ];
    },
  },
});
