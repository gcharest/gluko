import { defineStore } from "pinia";
import { useLocalStorage, useSessionStorage } from "@vueuse/core";

export type userSession = {
  dismissedExperimentNotice: boolean;
  darkMode: boolean;
};

export const userSessionStore = defineStore("userSession", () => {
  const userSession = useSessionStorage("userSession", {
    dismissedExperimentNotice: false,
    darkMode: true,
  } as userSession);

  function toggleDarkMode() {
    userSession.value.darkMode = !userSession.value.darkMode;
  }

  function $reset() {
    userSession.value = {
      dismissedExperimentNotice: false,
      darkMode: true,
    };
  }
  return {
    userSession,
    toggleDarkMode,
    $reset,
  };
});
