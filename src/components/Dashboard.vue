<template>
  <div
    class="container-fluid d-flex flex-column justify-content-center align-items-center min-vh-100 position-relative p-3">
    <!-- Botón de reinicio -->
    <button class="btn btn-outline-dark reset-btn" data-bs-toggle="modal" data-bs-target="#scoreModal">
      <img src="/iconopuntaje.svg" alt="Puntaje Icon" class="icon" />
    </button>

    <!-- MODAL de Bootstrap -->
    <div class="modal fade" id="scoreModal" tabindex="-1" aria-labelledby="scoreModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content p-3"
          style="border: 3px solid black; border-bottom: 7px solid black; border-radius: 10px;">
          <!-- Encabezado del modal -->
          <div class="modal-header border-0">
            <span class="me-2">
              <img src="/iconopuntaje.svg" alt="Oro" style="width: 24px; height: 24px;" />
            </span>
            <h5 class="modal-title" id="scoreModalLabel">Puntuaciones:</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
          </div>
          <hr class="custom-hr">
          <!-- Cuerpo del modal: listado de jugadores -->
          <div class="modal-body">
            <ul class="list-unstyled m-0 p-0">
              <li v-for="(player, index) in sortedPlayers" :key="player.name"
                class="mb-2 d-flex align-items-center justify-content-between">
                <!-- Nombre y puntaje -->
                <div>
                  <strong>{{ player.name }}</strong>: {{ player.score }} pts
                </div>

                <!-- Ícono según posición (primeros 3) -->
                <div>
                  <span v-if="index === 0">
                    <img src="/oro.svg" alt="Oro" style="width: 24px; height: 24px;" />
                  </span>
                  <span v-else-if="index === 1">
                    <img src="/plata.svg" alt="Plata" style="width: 24px; height: 24px;" />
                  </span>
                  <span v-else-if="index === 2">
                    <img src="/cobre.svg" alt="Bronce" style="width: 24px; height: 24px;" />
                  </span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Imagen de perfil (usuario logueado o invitado) -->
    <div class="user-avatar position-absolute top-0 m-3">
      <img :src="userImage" alt="Avatar" class="rounded-circle shadow"
        style="width: 50px; height: 50px; object-fit: cover; border: 3px solid black;" />
    </div>



    <!-- Vidasx -->
    <div class="lives">
      ❤️
      <span class="lives-count">{{ maxErrors - wrongGuesses }}</span>
    </div>

    <!-- Sección de la imagen del ahorcado -->
    <div class="row w-100 justify-content-center mt-4">
      <div class="col-12 col-sm-8 col-md-6 text-center">
        <img :src="hangmanImages[wrongGuesses]" class="hangman-img" alt="Ahorcado" v-if="wrongGuesses <= maxErrors" />
      </div>
    </div>

    <!-- Palabra oculta -->
    <div class="row w-100 justify-content-center my-4">
      <div class="col-auto">
        <div class="word-display">
          <span v-for="(letter, index) in displayWord" :key="index" class="letter">
            {{ letter !== "_" ? letter : "" }}
          </span>
        </div>
      </div>
    </div>

    <!-- Teclado -->
    <div class="row w-100 justify-content-center">
      <div class="col-12">
        <div class="keyboard container">
          <div class="row justify-content-center">
            <!-- Primera fila (A - N)-->
            <div v-for="(letter, index) in alphabet.slice(0, 14)" :key="index" class="col text-center p-1">
              <button class="btn key w-100" :class="getLetterClass(letter)" @click="guessLetter(letter)"
                :disabled="guessedLetters.includes(letter)">
                {{ letter }}
              </button>
            </div>
          </div>

          <div class="row mt-2 justify-content-center">
            <!-- Segunda fila (Ñ - Z)-->
            <div v-for="(letter, index) in alphabet.slice(14, 27)" :key="index" class="col text-center p-1">
              <button class="btn key w-100" :class="getLetterClass(letter)" @click="guessLetter(letter)"
                :disabled="guessedLetters.includes(letter)">
                {{ letter }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Mensaje de fin de juego -->
    <div v-if="gameOver" class="game-over text-center mt-4">
      <p class="message">{{ message }}</p>
      <button @click="resetGame" class="btn-restart">Jugar de nuevo</button>
    </div>


  </div>
</template>

<script>
import { collection, getDocs } from "firebase/firestore";
import { db } from "../FireBase/firebaseConfig";
import { useUserStore } from "../stores/user";

export default {
  data() {
    return {
      word: "",
      guessedLetters: [],
      wrongGuesses: 0,
      maxErrors: 6,
      gameOver: false,
      message: "",
      alphabet: "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ".split(""),
      hangmanImages: [
        "/0.svg",
        "/1.svg",
        "/2.svg",
        "/3.svg",
        "/4.svg",
        "/5.svg",
        "/6.svg"
      ],
      players: [
        { name: "Yahir", score: 21500 },
        { name: "Abigail", score: 20999 },
        { name: "Jazmin", score: 15300 },
        { name: "Mike", score: 15200 },
        { name: "Joel", score: 15200 },
      ],
      wordsFromFirestore: [], // Aquí guardaremos las palabras de Firebase
    };
  },

  computed: {
    displayWord() {
      return this.word.split("").map(letter =>
        this.guessedLetters.includes(letter) ? letter : "_"
      );
    },
    sortedPlayers() {
      return [...this.players].sort((a, b) => b.score - a.score);
    },
    userStore() {
      return useUserStore();
    },
    userImage() {
      if (this.userStore.authMethod === "google" && this.userStore.userData?.photoURL) {
        return this.userStore.userData.photoURL;
      } else {
        return "/usuario.png";
      }
    },

  },

  methods: {
    guessLetter(letter) {
      const upperLetter = letter.toUpperCase();

      if (this.gameOver || this.guessedLetters.includes(upperLetter)) return;
      this.guessedLetters.push(upperLetter);

      if (!this.word.includes(upperLetter)) {
        this.wrongGuesses++;
      }

      this.checkGameStatus();
    },

    checkGameStatus() {
      if (this.displayWord.join("") === this.word) {
        this.gameOver = true;
        this.message = "¡Ganaste!";
      } else if (this.wrongGuesses >= this.maxErrors) {
        this.gameOver = true;
        this.message = `Perdiste. La palabra era ${this.word}`;
      } else {
        this.gameOver = false; // aún quedan vidas y letras por adivinar
        this.message = "";
      }
    },

    resetGame() {
      if (this.wordsFromFirestore.length > 0) {
        this.word =
          this.wordsFromFirestore[
          Math.floor(Math.random() * this.wordsFromFirestore.length)
          ];
        this.guessedLetters = [];
        this.wrongGuesses = 0;
        this.gameOver = false;
        this.message = "";
      } else {
        console.error("No hay palabras cargadas desde Firebase");
      }
    },
    getLetterClass(letter) {
      if (!this.guessedLetters.includes(letter)) {
        return "key-normal";
      }
      return this.word.includes(letter) ? "key-correct" : "key-wrong";
    },

    async loadWordsFromFirestore() {
      const wordsCollection = collection(db, "Palabras");
      const wordsSnapshot = await getDocs(wordsCollection);
      this.wordsFromFirestore = wordsSnapshot.docs.map(doc => doc.data().Palabra.toUpperCase());
      this.resetGame();
    },
  },

  created() {
    this.loadWordsFromFirestore();
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

.reset-btn {
  position: absolute;
  top: 15px;
  left: 15px;
  font-size: 24px;
  background: white;
  border: 3px solid black;
  border-bottom: 7px solid black;
  font-size: 18px;
  font-weight: bold;
  border-radius: 8px;
  cursor: pointer;
}

/* Vidas */
.lives {
  position: absolute;
  top: 15px;
  right: 15px;
  font-size: 24px;
  font-weight: bold;
  color: black;
}

.lives-count {
  font-size: 20px;
  font-weight: bold;
  background: white;
  border-radius: 5px;
}

/* Imagen del ahorcado */
.hangman-img {
  width: 180px;
  max-width: 100%;
}

.custom-hr {
  border: none;
  height: 4px;
  background-color: black;
  opacity: 1;
  margin-top: 0;
  margin-bottom: 1rem;
  border-radius: 2px;
}

/* Palabra oculta */
.word-display {
  display: flex;
  gap: 10px;
  font-size: 24px;
  font-weight: bold;
  letter-spacing: 2px;
}

.letter {
  display: inline-block;
  width: 30px;
  height: 40px;
  text-align: center;
  border-bottom: 2px dashed black;
}

/* Teclado */
.keyboard {
  background-color: transparent;
  padding: 15px;
  border-radius: 10px;
}

/* Botones del teclado */
.key {
  border: 3px solid black;
  border-bottom: 7px solid black;
  font-size: 18px;
  font-weight: bold;
  border-radius: 8px;
  cursor: pointer;
  text-transform: uppercase;
  transition: background 0.2s, color 0.2s;

  max-width: 60px;
  max-height: 60px;
  width: 100%;
  height: auto;
}

/* Variaciones de color */
.key-normal {
  background: white;
  color: #00a6ff;
}

.key-normal:hover {
  background: #00a6ff;
  color: white;
}

.key-correct {
  background: #00e42e;
  color: white;
}

.key-wrong {
  background: #ff0000;
  color: white;
}

/* Mensaje de fin de juego */
.game-over {
  margin-top: 20px;
}

.message {
  font-size: 24px;
  font-weight: bold;
}

.btn-restart {
  margin-top: 15px;
  font-size: 18px;
  font-weight: 700;
  border: 3px solid black;
  border-bottom: 7px solid black;
  background: white;
  color: black;
  border-radius: 8px;
  padding: 10px 20px;
}

.btn-restart:hover {
  background: rgba(0, 0, 0, 0.568);
  color: white;
}
</style>
