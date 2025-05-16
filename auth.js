import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { app } from "./firebase-init.js";

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const loginBtn = document.getElementById('loginBtn');
if (loginBtn) {
  loginBtn.addEventListener('click', () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        console.log("Logged in:", result.user.displayName);
        window.location.href = "admin_table.html";
      })
      .catch((error) => console.error("Login error", error));
  });
}

// Optional auto-redirect if already logged in
onAuthStateChanged(auth, user => {
  if (user && window.location.pathname.endsWith("admin.html")) {
    window.location.href = "admin_table.html";
  }
});
