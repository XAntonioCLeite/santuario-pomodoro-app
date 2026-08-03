import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAbtBZpeld9I58LOHfNlfi2xcBvVKtSpZA",
  authDomain: "pomodoro-6e45f.firebaseapp.com",
  projectId: "pomodoro-6e45f",
  storageBucket: "pomodoro-6e45f.firebasestorage.app",
  messagingSenderId: "1033192402509",
  appId: "1:1033192402509:web:18320e8de63ef63b8cb604",
  measurementId: "G-H7Y696K4Z8"
};

const app = initializeApp(firebaseConfig);
let analytics = null;

isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
  }
}).catch((err) => {
  console.warn("Analytics not supported in this environment:", err);
});

const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/calendar.readonly');

export { app, analytics, db, auth, storage, googleProvider };
