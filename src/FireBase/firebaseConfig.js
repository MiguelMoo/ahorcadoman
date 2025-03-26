// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirestore, getDoc, doc, setDoc } from "firebase/firestore";

// Firebase configuration
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

const signInWithGoogle = async () => {
  try {
    const res = await signInWithPopup(auth, googleProvider);
    const user = res.user;
    const userDoc = await getDoc(doc(db, "users", user.uid));

    if (!userDoc.exists()) {
      await setDoc(doc(db, "users", user.uid), {
        name: user.displayName,
        email: user.email,
        photo: user.photoURL,
      });
    }
  } catch (error) {
    console.error("Error signing in with Google: ", error);
  }
};

export { db, signInWithGoogle };
