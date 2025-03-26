<template>
  <div class="d-flex flex-column justify-content-center align-items-center min-vh-100">
    <div class="login-container text-center">
      <h1 class="mb-4 title">La Oca</h1>
      <img src="/6.svg" class="img-fluid mb-3" alt="La Oca" />

      <div class="d-flex flex-column align-items-center justify-content-center">
        <!-- Botón de Jugar -->
        <button @click="accessAsGuest" class="btn btn-outline-dark btn-lg fw-bold w-100 mb-2 play-btn">
          Jugar
        </button>

        <!-- Botón de Iniciar sesión con Google -->
        <button @click="loginWithGoogle"
          class="btn btn-outline-dark btn-lg fw-bold w-100 d-flex align-items-center justify-content-center login-btn">
          <img src="https://www.svgrepo.com/show/355037/google.svg" alt="Google Icon" class="icon me-2" />
          Iniciar sesión
        </button>
      </div>

      <!-- Mensaje de error -->
      <p v-if="errorMessage" class="text-danger mt-3">{{ errorMessage }}</p>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { auth, googleProvider, db } from "../FireBase/firebaseConfig";
import { signInWithPopup } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { useUserStore } from "../stores/user";

export default {
  setup() {
    const router = useRouter();
    const errorMessage = ref("");
    const userStore = useUserStore();

    const loginWithGoogle = async () => {
      try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;

        // Guarda los datos del usuario en Firestore
        await setDoc(doc(db, "users", user.uid), {
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          lastLogin: new Date(),
        });

        userStore.setAuthMethod("google");
        userStore.setUserData(user);
        router.push("/dashboard");
      } catch (error) {
        errorMessage.value = "Error al iniciar sesión: " + error.message;
      }
    };

    const accessAsGuest = () => {
      userStore.setAuthMethod("invitado");
      userStore.setUserData(null);
      router.push("/dashboard");
    };

    return { loginWithGoogle, accessAsGuest, errorMessage };
  },
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Kumbh+Sans:wght@100..900&display=swap');

html,
body {
  margin: 0;
  padding: 0;
  font-family: 'Kumbh Sans', sans-serif;
}

.login-container {
  max-width: 400px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 30px;
  width: 90%;
}

h1 {
  font-size: 40px;
  font-weight: 900;
  letter-spacing: 2px;
  margin-bottom: 15px;
}

p {
  font-size: 20px;
  font-weight: 600;
  letter-spacing: 1px;
}

button {
  padding: 12px;
  font-size: 18px;
  border-radius: 10px;
  border: 3px solid black;
  border-bottom: 7px solid black;
  background: white;
  color: black;
}

button:hover {
  background: rgba(0, 0, 0, 0.568);
  color: white;
}

.play-btn,
.login-btn {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 2px;
}

.icon {
  width: 24px;
  height: 24px;
}
</style>
