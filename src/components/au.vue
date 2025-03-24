<template>
    <div class="dashboard">
      <h2>Bienvenido al Dashboard</h2>
      <p v-if="user">Usuario: {{ user.displayName || "Invitado" }}</p>
      <button @click="logout">Cerrar sesión</button>
    </div>
  </template>
  
  <script>
  import { ref, onMounted } from "vue";
  import { useRouter } from "vue-router";
  import { auth } from "../firebase/firebaseConfig";
  import { signOut, onAuthStateChanged } from "firebase/auth";
  
  export default {
    setup() {
      const router = useRouter();
      const user = ref(null);
  
      onMounted(() => {
        onAuthStateChanged(auth, (loggedUser) => {
          user.value = loggedUser;
        });
      });
  
      const logout = async () => {
        await signOut(auth);
        router.push("/");
      };
  
      return { user, logout };
    },
  };
  </script>
  
  <style scoped>
  .dashboard {
    text-align: center;
    margin-top: 50px;
  }
  
  button {
    background: red;
    color: white;
    padding: 10px;
    border: none;
    cursor: pointer;
  }
  </style>
  