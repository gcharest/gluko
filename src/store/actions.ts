// store/actions.ts
import { ActionContext, ActionTree } from "vuex";
import { Mutations, MutationType } from "@/store/mutations";
import { State } from "@/store/state";

export enum ActionTypes {
  GetProfileItems = "GET_PROFILE_ITEMS"
}

type ActionAugments = Omit<ActionContext<State, State>, "commit"> & {
  commit<K extends keyof Mutations>(
    key: K,
    payload: Parameters<Mutations[K]>[1]
  ): ReturnType<Mutations[K]>;
};

export type Actions = {
  [ActionTypes.GetProfileItems](context: ActionAugments): void;
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
export const actions: ActionTree<State, State> & Actions = {
  async [ActionTypes.GetProfileItems]({ commit }) {
    commit(MutationType.SetLoading, true);
  }
};
