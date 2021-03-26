import { GetterTree } from "vuex";
import { State, Profile, Meal, Nutrient } from "@/store/state";

export type Getters = {
  totalProfilesCount(state: State): number;
  totalProfileMealsCount(state: State): (profileId: number) => number;
  totalProfileMealNutrientsCount: (
    state: State
  ) => (profileId: number, mealId: number) => number;
  getAllProfiles: (state: State) => Profile[] | undefined;
  getProfileById: (state: State) => (profileId: number) => Profile | undefined;
  getAllProfileMeals: (
    state: State
  ) => (profileId: number) => Meal[] | undefined;
  getProfileMealById: (
    state: State,
    getters: Getters
  ) => (profileId: number, mealId: number) => Meal | undefined;
  getProfileMealCarbsTotal: (
    state: State,
    getters: Getters
  ) => (profileId: number, mealId: number) => number;
  getAllProfileMealNutrients: (
    state: State,
    getters: Getters
  ) => (profileId: number, mealId: number) => Nutrient[] | undefined;
  getProfileMealNutrientById: (
    state: State,
    getters: Getters
  ) => (
    profileId: number,
    mealId: number,
    nutrientId: number
  ) => Nutrient | undefined;
  getNutrientCarbsSubtotal: (
    state: State,
    getters: Getters
  ) => (profileId: number, mealId: number, nutrientId: number) => number;
};

export const getters: GetterTree<State, State> & Getters = {
  totalProfilesCount(state) {
    return state.profiles.length;
  },
  totalProfileMealsCount: state => (profileId: number) => {
    const profile = state.profiles.find(profile => profile.id === profileId);
    if (profile === undefined) {
      return 0;
    }
    return profile.meals.length;
  },
  totalProfileMealNutrientsCount: state => (
    profileId: number,
    mealId: number
  ) => {
    const profileIndex = state.profiles.findIndex(
      profile => profile.id === profileId
    );
    if (profileIndex === -1) return 0;

    const mealIndex = state.profiles[profileIndex].meals.findIndex(
      meal => meal.id === mealId
    );
    if (mealIndex === -1) return 0;
    return state.profiles[profileIndex].meals[mealIndex].nutrients.length;
  },
  getAllProfiles(state) {
    return state.profiles;
  },
  getProfileById: state => (profileId: number) => {
    return state.profiles.find(profile => profile.id === profileId);
  },
  getAllProfileMeals: state => (profileId: number) => {
    const profileIndex = state.profiles.findIndex(
      profile => profile.id === profileId
    );
    if (profileIndex === -1) return undefined;

    return state.profiles[profileIndex].meals;
  },
  getProfileMealById: (state, getters) => (
    profileId: number,
    mealId: number
  ) => {
    const profile = getters.getProfileById(state)(profileId);
    if (profile === undefined) return undefined;
    return profile.meals.find(meal => meal.id === mealId);
  },
  getProfileMealCarbsTotal: (state, getters) => (profileId, mealId) => {
    const meal = getters.getProfileMealById(state, getters)(profileId, mealId);
    if (meal === undefined) return 0;

    const totalCarbs = meal.nutrients.reduce(
      (accumulator, currentValue) =>
        accumulator + currentValue.serving * currentValue.factor,
      0
    );

    return totalCarbs;
  },
  getAllProfileMealNutrients: (state, getters) => (profileId, mealId) => {
    const meal = getters.getProfileMealById(state, getters)(profileId, mealId);
    if (meal === undefined) return undefined;
    return meal.nutrients;
  },
  getProfileMealNutrientById: (state, getters) => (
    profileId,
    mealId,
    nutrientId
  ) => {
    const meal = getters.getProfileMealById(state, getters)(profileId, mealId);
    if (meal === undefined) return undefined;

    return meal.nutrients.find(nutrient => nutrient.id === nutrientId);
  },
  getNutrientCarbsSubtotal: (state, getters) => (
    profileId,
    mealId,
    nutrientId
  ) => {
    const nutrient = getters.getProfileMealNutrientById(state, getters)(
      profileId,
      mealId,
      nutrientId
    );
    if (nutrient === undefined) return 0;
    return nutrient.factor * nutrient.serving;
  }
};
