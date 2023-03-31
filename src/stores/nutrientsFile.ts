import { defineStore } from "pinia";
import { useSessionStorage } from "@vueuse/core";

export interface NutrientFile {
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
}

export const useNutrientFileStoreSetup = defineStore("nutrientsFile", () => {
  const nutrientsFile = useSessionStorage(
    "nutrientsFile",
    [] as NutrientFile[]
  );

  function $reset() {
    nutrientsFile.value = [];
  }

  return {
    nutrientsFile,
    $reset,
  };
});
