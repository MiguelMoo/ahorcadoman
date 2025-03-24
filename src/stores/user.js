// stores/user.js
import { defineStore } from "pinia";

export const useUserStore = defineStore("user", {
  state: () => ({
    authMethod: null,
    userData: null,
  }),
  actions: {
    setAuthMethod(method) {
      console.log(`Accediendo como: ${method}`);
      this.authMethod = method;
    },
    setUserData(data) {
      console.log(`info: ${data}`);

      this.userData = data;
    },
    clearAuth() {
      this.authMethod = null;
      this.userData = null;
    },
  },
});
