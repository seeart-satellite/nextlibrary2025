import { getFirestore, collection, getDocs, updateDoc, doc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { app } from "./firebase-init.js";

const db = getFirestore(app);
const auth = getAuth(app);

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "admin.html";
    return;
  }

  // Fetch and populate messages
  const messagesRef = collection(db, "messages");
  const snapshot = await getDocs(messagesRef);
  const messageTable = document.getElementById("messageTable");

  snapshot.forEach((docSnap) => {
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
    messageTable.appendChild(row);
  });

  // Fetch and populate emails
  const emailsRef = collection(db, "emails");
  const emailSnap = await getDocs(emailsRef);
  const emailTable = document.getElementById("emailTable");

  emailSnap.forEach((docSnap) => {
    const data = docSnap.data();
    const row = document.createElement("tr");

    const fields = [
      data.email,
      data.section,
      data.wantsUpdates,
      data.isNextLibrary,
      data.isDokk1Visitor,
      data.isOther,
      data.otherText,
      data.timestamp?.toDate().toLocaleString() || ""
    ];

    fields.forEach((value) => {
      const cell = document.createElement("td");
      cell.textContent = value;
      row.appendChild(cell);
    });

    emailTable.appendChild(row);
  });

  // Attach logout handler
  const logoutLink = document.getElementById("logout");
  if (logoutLink) {
    logoutLink.addEventListener("click", async (e) => {
      e.preventDefault();
      try {
        await signOut(auth);
        console.log("User signed out");
        window.location.href = "admin.html";
      } catch (error) {
        console.error("Logout error:", error);
      }
    });
  }
});

// CSV export function must be globally accessible
window.exportEmailCSV = function () {
  const table = document.getElementById("emailTable");
  let csv = [];

  for (let row of table.rows) {
    let cols = Array.from(row.cells).map((cell) => `"${cell.innerText}"`);
    csv.push(cols.join(","));
  }

  const csvContent = csv.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "email-data.csv";
  link.click();

  URL.revokeObjectURL(url);
};
