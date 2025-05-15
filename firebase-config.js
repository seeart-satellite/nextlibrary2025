// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCmOJqkT8eJgbXl1te6PlOS49o3ghqFxA4",
  authDomain: "nextlibrary2025.firebaseapp.com",
  projectId: "nextlibrary2025",
  storageBucket: "nextlibrary2025.firebasestorage.app",
  messagingSenderId: "1057219567450",
  appId: "1:1057219567450:web:9e33e6a12fd0bb587f1d63"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };


