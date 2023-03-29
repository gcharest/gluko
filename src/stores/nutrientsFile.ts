import { defineStore } from "pinia";
import { useSessionStorage } from "@vueuse/core";
import dataset from "@/components/data/canadian_nutrient_file.json";

export type nutrientData = {
  FoodID: number;
  FoodCode: number;
  FoodGroupID: number;
  FoodSourceID: number;
  FoodDescription: string;
  FoodDescriptionF: string;
  "203": number;
  "204": number;
  "205": number;
  "291": number | null;
  FoodGroupName: string;
  FoodGroupNameF: string;
  FctGluc: number | null;
};

type nutrientDataList = Array<nutrientData>;

export const useNutrientsFileStore = defineStore({
  id: "nutrientsFile",
  state: () => ({
    nutrientsFile: useSessionStorage("nutrientsFile", [] as nutrientDataList),
  }),
  getters: {
    getAllNutrients(): nutrientData[] {
      return this.nutrientsFile;
    },
  },
  actions: {
    initialize() {
      this.nutrientsFile = dataset;
    },
    reset() {
      this.nutrientsFile = [];
    },
  },
});
