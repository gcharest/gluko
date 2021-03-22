// /store/mutations.ts
import { MutationTree } from "vuex";
import { State, Profile, Meal, Nutrient } from "./state";

export enum MutationType {
  CreateProfile = "CREATE_PROFILE",
  SetProfiles = "SET_PROFILES",
  EditProfile = "EDIT_PROFILE",
  UpdateProfile = "UPDATE_PROFILE",
  RemoveProfile = "REMOVE_PROFILE",
  CreateMeal = "CREATE_MEAL",
  SetMeals = "SET_MEALS",
  EditMeal = "EDIT_MEAL",
  UpdateMeal = "UPDATE_MEAL",
  RemoveMeal = "REMOVE_MEAL",
  CreateNutrient = "CREATE_NUTRIENT",
  SetNutrients = "SET_NUTRIENTS",
  EditNutrient = "EDIT_NUTRIENT",
  UpdateNutrient = "UPDATE_NUTRIENT",
  RemoveNutrient = "REMOVE_NUTRIENT",
  SetLoading = "SET_LOADING"
}

export type Mutations = {
  [MutationType.CreateProfile](state: State, profile: Profile): void;
  [MutationType.SetProfiles](state: State, profiles: Profile[]): void;
  [MutationType.EditProfile](
    state: State,
    profile: Partial<Profile> & { id: number }
  ): void;
  [MutationType.UpdateProfile](
    state: State,
    profile: Partial<Profile> & { id: number }
  ): void;
  [MutationType.RemoveProfile](
    state: State,
    profile: Partial<Profile> & { id: number }
  ): void;
  [MutationType.CreateMeal](
    state: State,
    value: {
      profileID: number;
      meal: Meal;
    }
  ): void;
  [MutationType.SetMeals](
    state: State,
    value: { profileId: number; meals: Meal[] }
  ): void;
  [MutationType.EditMeal](
    state: State,
    value: { profileId: number; meal: Partial<Meal> & { id: number } }
  ): void;
  [MutationType.UpdateMeal](
    state: State,
    value: { profileId: number; meal: Partial<Meal> & { id: number } }
  ): void;
  [MutationType.RemoveMeal](
    state: State,
    value: { profileId: number; meal: Partial<Meal> & { id: number } }
  ): void;
  [MutationType.CreateNutrient](
    state: State,
    value: {
      profileId: number;
      mealId: number;
      nutrient: Nutrient;
    }
  ): void;
  [MutationType.SetNutrients](
    state: State,
    value: { profileId: number; mealId: number; nutrients: Nutrient[] }
  ): void;
  [MutationType.EditNutrient](
    state: State,
    value: {
      profileId: number;
      mealId: number;
      nutrient: Partial<Nutrient> & { id: number };
    }
  ): void;
  [MutationType.UpdateNutrient](
    state: State,
    value: {
      profileId: number;
      mealId: number;
      nutrient: Partial<Nutrient> & { id: number };
    }
  ): void;
  [MutationType.RemoveNutrient](
    state: State,
    value: {
      profileId: number;
      mealId: number;
      nutrient: Partial<Nutrient> & { id: number };
    }
  ): void;
  [MutationType.SetLoading](state: State, loading: boolean): void;
};

export const mutations: MutationTree<State> & Mutations = {
  [MutationType.CreateProfile](state, profile) {
    state.profiles.unshift(profile);
  },
  [MutationType.SetProfiles](state, profiles) {
    state.profiles = profiles;
  },
  [MutationType.EditProfile](state, profile) {
    const profileIndex = state.profiles.findIndex(
      element => element.id === profile.id
    );
    if (profileIndex === -1) {
      return;
    }
    state.profiles[profileIndex] = {
      ...state.profiles[profileIndex],
      editing: !state.profiles[profileIndex].editing
    };
  },
  [MutationType.UpdateProfile](state, profile) {
    state.profiles.map(thisProfile => {
      if (thisProfile.id === profile.id) {
        return { ...thisProfile, ...profile };
      }
      return thisProfile;
    });
  },
  [MutationType.RemoveProfile](state, profile) {
    const profileIndex = state.profiles.findIndex(
      element => element.id === profile.id
    );
    if (profileIndex === -1) {
      return;
    }
    state.profiles.splice(profileIndex, 1);
  },
  [MutationType.CreateMeal](state, value) {
    const profileIndex = state.profiles.findIndex(
      element => element.id === value.profileID
    );
    if (profileIndex === -1) {
      return;
    }
    state.profiles[profileIndex].meals.unshift(value.meal);
  },
  [MutationType.SetMeals](state, value) {
    const profile = state.profiles.find(
      element => element.id === value.profileId
    );
    if (profile === undefined) {
      return;
    }
    profile.meals = value.meals;
  },
  [MutationType.EditMeal](state, value) {
    const profile = state.profiles.find(
      element => element.id === value.profileId
    );
    if (profile === undefined) {
      return;
    }
    const mealIndex = profile.meals.findIndex(
      element => element.id === value.meal.id
    );
    if (mealIndex === -1) {
      return;
    }
    profile.meals[mealIndex] = {
      ...profile.meals[mealIndex],
      editing: !profile.meals[mealIndex]
    };
  },
  [MutationType.UpdateMeal](state, value) {
    const profile = state.profiles.find(
      element => element.id === value.profileId
    );
    if (profile === undefined) {
      return;
    }
    profile.meals.map(thisMeal => {
      if (thisMeal.id === value.meal.id) {
        return { ...thisMeal, ...value.meal };
      }
      return thisMeal;
    });
  },
  [MutationType.RemoveMeal](state, value) {
    const profile = state.profiles.find(
      element => element.id === value.profileId
    );
    if (profile === undefined) {
      return;
    }
    const mealIndex = profile.meals.findIndex(
      element => element.id === value.meal.id
    );
    if (mealIndex === -1) {
      return;
    }
    profile.meals.splice(mealIndex, 1);
  },
  [MutationType.CreateNutrient](state, value) {
    const profile = state.profiles.find(
      element => element.id === value.profileId
    );
    if (profile === undefined) {
      return;
    }
    const meal = profile.meals.find(element => element.id === value.mealId);
    if (meal === undefined) {
      return;
    }
    meal.nutrients.unshift(value.nutrient);
  },
  [MutationType.SetNutrients](state, value) {
    const profile = state.profiles.find(
      element => element.id === value.profileId
    );
    if (profile === undefined) {
      return;
    }
    const meal = profile.meals.find(element => element.id === value.mealId);
    if (meal === undefined) {
      return;
    }
    meal.nutrients = value.nutrients;
  },
  [MutationType.EditNutrient](state, value) {
    const profile = state.profiles.find(
      element => element.id === value.profileId
    );
    if (profile === undefined) {
      return;
    }
    const meal = profile.meals.find(element => element.id === value.mealId);
    if (meal === undefined) {
      return;
    }
    const nutrientIndex = meal.nutrients.findIndex(
      element => (element.id = value.nutrient.id)
    );
    if (nutrientIndex === -1) {
      return;
    }
    meal.nutrients[nutrientIndex] = {
      ...meal.nutrients[nutrientIndex],
      editing: !meal.nutrients[nutrientIndex].editing
    };
  },
  [MutationType.UpdateNutrient](state, value) {
    const profile = state.profiles.find(
      element => element.id === value.profileId
    );
    if (profile === undefined) {
      return;
    }
    const meal = profile.meals.find(element => element.id === value.mealId);
    if (meal === undefined) {
      return;
    }
    meal.nutrients.map(thisNutrient => {
      if (thisNutrient.id === value.nutrient.id) {
        return { ...thisNutrient, ...value.nutrient };
      }
      return thisNutrient;
    });
  },
  [MutationType.RemoveNutrient](state, value) {
    const profile = state.profiles.find(
      element => element.id === value.profileId
    );
    if (profile === undefined) {
      return;
    }
    const meal = profile.meals.find(element => element.id === value.mealId);
    if (meal === undefined) {
      return;
    }
    const nutrientIndex = meal.nutrients.findIndex(
      element => element.id === value.nutrient.id
    );
    if (nutrientIndex === -1) {
      return;
    }
    meal.nutrients.splice(nutrientIndex, 1);
  },
  [MutationType.SetLoading](state, loading) {
    state.loading = loading;
  }
};
