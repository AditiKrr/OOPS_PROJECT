// Firebase Configuration and Authentication
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, RecaptchaVerifier, signInWithPhoneNumber, FacebookAuthProvider } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDc3GmKEe4gusERf3LI_7OoKgN6nHB9iOk",
  authDomain: "livemart12.firebaseapp.com",
  projectId: "livemart12",
  storageBucket: "livemart12.firebasestorage.app",
  messagingSenderId: "251902900930",
  appId: "1:251902900930:web:8fd643508d732f20ed195b",
  measurementId: "G-7XWCZLKRLD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app);

// Export for use in other files
export { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, RecaptchaVerifier, signInWithPhoneNumber, FacebookAuthProvider };

console.log('Firebase initialized successfully! 🔥');
