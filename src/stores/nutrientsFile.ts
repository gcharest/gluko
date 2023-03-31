import { defineStore } from "pinia";
import { useSessionStorage } from "@vueuse/core";
import dataset from "@/components/data/canadian_nutrient_file.json";
import Fuse from "fuse.js";

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

export const useNutrientFileStore = defineStore("nutrientsFile", () => {
  const nutrientsFile = useSessionStorage(
    "nutrientsFile",
    [] as NutrientFile[]
  );

  const favoriteNutrients = useSessionStorage(
    "favoriteNutrients",
    [] as number[]
  );

  function searchNutrients(search: string) {
    const options = {
      keys: ["FoodDescriptionF", "FoodDescription"],
      location: 0,
      distance: 200,
      threshold: 0.2,
      isCaseSensitive: false,
      includeMatches: true,
    };

    const fuse = new Fuse(nutrientsFile.value, options);
    return fuse.search(search);
  }

  function $reset() {
    nutrientsFile.value = dataset;
  }

  return {
    nutrientsFile,
    favoriteNutrients,
    searchNutrients,
    $reset,
  };
});
