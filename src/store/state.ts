// /store/state.ts
export type Profile = {
  id: number;
  name: string;
  meals: Meal[];
  editing: boolean;
};

export type Meal = {
  id: number;
  date: Date;
  nutrients: Nutrient[];
  editing: boolean;
};

export type Nutrient = {
  id: number;
  name: string;
  serving: number;
  factor: number;
  editing: boolean;
};

export type State = {
  loading: boolean;
  profiles: Profile[];
};

export const state: State = {
  loading: false,
  profiles: []
};
