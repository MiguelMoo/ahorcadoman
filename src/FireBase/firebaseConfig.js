// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB_3w_y7dWrY4wcwbG_h-UV0DsoNIb0a4k",
  authDomain: "ahorcadoman.firebaseapp.com",
  projectId: "ahorcadoman",
  storageBucket: "ahorcadoman.firebasestorage.app",
  messagingSenderId: "629812008614",
  appId: "1:629812008614:web:3423ece2e7fca94b898667",
  measurementId: "G-G4W1WERDVR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const db = getFirestore(app);  

export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();
export { db };  
