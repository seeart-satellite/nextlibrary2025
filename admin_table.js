import { getFirestore, collection, getDocs, updateDoc, doc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { app } from "firebase-init.js";

const db = getFirestore(app);
const auth = getAuth(app);

// Only allow access if user is signed in
onAuthStateChanged(auth, async user => {
  if (!user) {
    window.location.href = "admin.html";
    return;
  }

  const messagesRef = collection(db, "messages");
  const snapshot = await getDocs(messagesRef);
  const table = document.getElementById("messageTable");

  snapshot.forEach(docSnap => {
    const data = docSnap.data();

    const row = document.createElement("tr");

    const textCell = document.createElement("td");
    textCell.textContent = data.text || "(no text)";
    row.appendChild(textCell);

    const visibleCell = document.createElement("td");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = data.visible ?? true;

    checkbox.addEventListener("change", async () => {
      await updateDoc(doc(db, "messages", docSnap.id), {
        visible: checkbox.checked
      });
    });

    visibleCell.appendChild(checkbox);
    row.appendChild(visibleCell);

    table.appendChild(row);
  });
});

// Logout button handler
document.addEventListener("DOMContentLoaded", () => {
  const logoutLink = document.getElementById("logout");
  if (logoutLink) {
    logoutLink.addEventListener("click", (e) => {
      e.preventDefault();
      signOut(auth)
        .then(() => {
          console.log("User signed out");
          window.location.href = "admin.html"; // redirect after logout
        })
        .catch((error) => {
          console.error("Logout error:", error);
        });
    });
  }
});
