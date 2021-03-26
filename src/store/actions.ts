// store/actions.ts
import { ActionContext, ActionTree } from "vuex";
import { Mutations, MutationType } from "@/store/mutations";
import { State } from "@/store/state";
import defaultData from "@/assets/default.json";

export enum ActionTypes {
  GetProfileItems = "GET_PROFILE_ITEMS",
  SetProfileItems = "SET_PROFILE_ITEMS"
}

type ActionAugments = Omit<ActionContext<State, State>, "commit"> & {
  commit<K extends keyof Mutations>(
    key: K,
    payload: Parameters<Mutations[K]>[1]
  ): ReturnType<Mutations[K]>;
};

export type Actions = {
  [ActionTypes.GetProfileItems](context: ActionAugments): void;
  [ActionTypes.SetProfileItems](context: ActionAugments): void;
};

export const actions: ActionTree<State, State> & Actions = {
  async [ActionTypes.GetProfileItems]({ commit }) {
    commit(MutationType.SetLoading, true);
    commit(MutationType.SetProfiles, defaultData.profiles);
    commit(MutationType.SetLoading, false);
  },
  async [ActionTypes.SetProfileItems]({ commit }) {
    commit(MutationType.SetProfiles, defaultData.profiles);
  }
};
