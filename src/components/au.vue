<template>
  <div class="dashboard">
    <h2>Bienvenido al Dashboard</h2>
    <p v-if="user">Usuario: {{ user.displayName || "Invitado" }}</p>

    <!-- Mostrar puntaje desencriptado -->
    <p v-if="score !== null">Puntaje: {{ score }}</p>

    <button @click="logout">Cerrar sesión</button>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { auth, db } from "../FireBase/firebaseConfig";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { useUserStore } from "../stores/user";
import CryptoJS from "crypto-js";
import { getDoc, doc } from "firebase/firestore";

export default {
  setup() {
    const router = useRouter();
    const userStore = useUserStore();
    const user = ref(null);
    const score = ref(null);

    onMounted(() => {
      // Revisa el estado del usuario
      onAuthStateChanged(auth, async (loggedUser) => {
        if (loggedUser) {
          user.value = loggedUser;
          userStore.setUserData(loggedUser);

          // Obtiene los datos del usuario desde Firestore
          const userDoc = await getDoc(doc(db, "users", loggedUser.uid));
          if (userDoc.exists()) {
            // Desencriptando el puntaje
            const encryptedScore = userDoc.data().score;
            const bytes = CryptoJS.AES.decrypt(encryptedScore, "secret-key");
            score.value = bytes.toString(CryptoJS.enc.Utf8);  // Convertir a texto
          }
        } else {
          user.value = null;
          userStore.setUserData(null);
        }
      });
    });

    const logout = async () => {
      await signOut(auth);
      userStore.setAuthMethod(null);
      userStore.setUserData(null);
      router.push("/");
    };

    return { user, score, logout };
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
