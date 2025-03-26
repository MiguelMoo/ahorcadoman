<template>
  <div class="container-fluid d-flex flex-column justify-content-center align-items-center min-vh-100 position-relative p-3">
    <button class="btn btn-outline-dark reset-btn" data-bs-toggle="modal" data-bs-target="#scoreModal">
      <img src="/iconopuntaje.svg" alt="Puntaje Icon" class="icon" />
    </button>

    <div class="modal fade" id="scoreModal" tabindex="-1" aria-labelledby="scoreModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content p-3" style="border: 3px solid black; border-bottom: 7px solid black; border-radius: 10px;">
          <div class="modal-header border-0">
            <span class="me-2">
              <img src="/iconopuntaje.svg" alt="Oro" style="width: 24px; height: 24px;" />
            </span>
            <h5 class="modal-title" id="scoreModalLabel">Puntuaciones:</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
          </div>
          <hr class="custom-hr">
          <div class="modal-body">
            <ul class="list-unstyled m-0 p-0">
              <li v-for="(player, index) in sortedPlayers" :key="player.name" class="mb-2 d-flex align-items-center justify-content-between">
                <div>
                  <strong>{{ player.name }}</strong>: {{ player.score }} pts
                </div>
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

    <div class="user-avatar position-absolute top-0 m-3">
      <img :src="userImage" alt="Avatar" class="rounded-circle shadow" style="width: 50px; height: 50px; object-fit: cover; border: 3px solid black;" />
    </div>

    <div class="lives">
      ❤️
      <span class="lives-count">{{ maxErrors - wrongGuesses }}</span>
    </div>

    <div class="points"> 
      <span class="user-points"> Puntaje: {{ userScore }}</span>
    </div>

    <div class="row w-100 justify-content-center mt-4">
      <div class="col-12 col-sm-8 col-md-6 text-center">
        <img :src="hangmanImages[wrongGuesses]" class="hangman-img" alt="Ahorcado" v-if="wrongGuesses <= maxErrors" />
      </div>
    </div>

    <div class="row w-100 justify-content-center my-4">
      <div class="col-auto">
        <div class="word-display">
          <span v-for="(letter, index) in displayWord" :key="index" class="letter">
            {{ letter !== "_" ? letter : "" }}
          </span>
        </div>
      </div>
    </div>

    <div class="row w-100 justify-content-center">
      <div class="col-12">
        <div class="keyboard container">
          <div class="row justify-content-center">
            <div v-for="(letter, index) in alphabet.slice(0, 14)" :key="index" class="col text-center p-1">
              <button class="btn key w-100" :class="getLetterClass(letter)" @click="guessLetter(letter)" :disabled="guessedLetters.includes(letter)">
                {{ letter }}
              </button>
            </div>
          </div>

          <div class="row mt-2 justify-content-center">
            <div v-for="(letter, index) in alphabet.slice(14, 27)" :key="index" class="col text-center p-1">
              <button class="btn key w-100" :class="getLetterClass(letter)" @click="guessLetter(letter)" :disabled="guessedLetters.includes(letter)">
                {{ letter }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="gameOver" class="game-over text-center mt-4">
      <p class="message">{{ message }}</p>
      <button v-if="gameOver" @click="resetGame" class="btn-restart">Siguiente palabra</button>
      <button v-if="gameOver && nextWord" @click="resetGame" class="btn-restart">Jugar de nuevo</button>
    </div>
  </div>
</template>
<script>
import { collection, getDocs, setDoc, doc, getDoc, onSnapshot } from "firebase/firestore";
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
      players: [],
      userScore: 0,
      wordsFromFirestore: [],
      unsubscribeScore: null,  // Función para cancelar la suscripción
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
      return this.userStore.authMethod === "google" && this.userStore.userData?.photoURL
        ? this.userStore.userData.photoURL
        : "/usuario.png";
    },
    displayUserScore() {
      // Si es cuenta de invitado, se muestra el mensaje para iniciar sesión
      return this.userStore.authMethod === "invitado"
        ? "Inicia sesión para guardar un puntaje"
        : this.userScore;
    },
  },

  methods: {
    guessLetter(letter) {
      const upperLetter = letter.toUpperCase();
      if (this.gameOver || this.guessedLetters.includes(upperLetter)) return;
      this.guessedLetters.push(upperLetter);

      if (this.word.includes(upperLetter)) {
        this.updateScore(10); // Sumar 10 puntos por letra correcta
      } else {
        this.wrongGuesses++;
      }

      this.checkGameStatus();
    },

    checkGameStatus() {
      if (this.displayWord.join("") === this.word) {
        this.gameOver = true;
        this.message = "¡Ganaste!";
        this.updateScore(100 * this.displayWord.length + 100 * (this.maxErrors - this.wrongGuesses));
      } else if (this.wrongGuesses >= this.maxErrors) {
        this.gameOver = true;
        this.message = `Perdiste. La palabra era ${this.word}`;
      }
    },

    resetGame() {
      if (this.wordsFromFirestore.length > 0) {
        this.word = this.wordsFromFirestore[Math.floor(Math.random() * this.wordsFromFirestore.length)];
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

    async loadScoresFromFirestore() {
      const scoresCollection = collection(db, "puntajes");
      const scoresSnapshot = await getDocs(scoresCollection);
      this.players = scoresSnapshot.docs.map(doc => doc.data());
    },

    async updateScore(points) {
      const user = this.userStore.userData;
      if (user) {
        const userRef = doc(db, "puntajes", user.uid);
        const userDoc = await getDoc(userRef);
        const previousScore = userDoc.exists() ? userDoc.data().score || 0 : 0;
        const newScore = previousScore + points;

        await setDoc(userRef, { name: user.displayName, score: newScore }, { merge: true });
        this.loadScoresFromFirestore();
      }
    },
  },

  created() {
    this.loadWordsFromFirestore();
    this.loadScoresFromFirestore();
  },

  mounted() {

    if (this.userStore.userData && this.userStore.authMethod !== "invitado") {
      const userRef = doc(db, "puntajes", this.userStore.userData.uid);
      this.unsubscribeScore = onSnapshot(userRef, (docSnap) => {
        if (docSnap.exists()) {
          this.userScore = docSnap.data().score;
        } else {
          this.userScore = 0;
        }
      });
    }
  },

  beforeDestroy() {
    if (this.unsubscribeScore) {
      this.unsubscribeScore();
    }
  },
};
</script>


<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Kumbh+Sans:wght@100..900&display=swap");

html,
body {
  margin: 0;
  padding: 0;
  font-family: "Kumbh Sans", sans-serif;
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

/* Vidas */
.points {
  position: absolute;
  top: 55px;
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
