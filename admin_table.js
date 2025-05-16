import { getFirestore, collection, getDocs, updateDoc, doc, query, orderBy } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { app } from "./firebase-init.js";

const db = getFirestore(app);
const auth = getAuth(app);

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "admin.html";
    return;
  }

  // Message table tab
  const messagesRef = query(collection(db, "messages"), orderBy("timestamp", "desc"));
  const snapshot = await getDocs(messagesRef);
  const messageTable = document.getElementById("messageTable");

  snapshot.forEach((docSnap) => {
  const data = docSnap.data();
  const row = document.createElement("tr");

  const textCell = document.createElement("td");
  textCell.textContent = data.text || "n/a";
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

  const sectionCell = document.createElement("td");
  sectionCell.textContent = data.section || "n/a";
  row.appendChild(sectionCell);

  const timestampCell = document.createElement("td");
  timestampCell.textContent = data.timestamp?.toDate().toLocaleString() || "n/a";
  row.appendChild(timestampCell);

  messageTable.querySelector("tbody").appendChild(row);
});


  // Email table tab
  const emailsQuery = query(collection(db, "emails"), orderBy("timestamp", "desc"));
  const emailSnap = await getDocs(emailsQuery);
  const emailTable = document.getElementById("emailTable");
  const emailTbody = emailTable.querySelector("tbody");

  emailSnap.forEach((docSnap) => {
  const data = docSnap.data();
  const row = document.createElement("tr");

  // Email
  const emailCell = document.createElement("td");
  emailCell.textContent = data.email || "n/a";
  row.appendChild(emailCell);

  // Section
  const sectionCell = document.createElement("td");
  sectionCell.textContent = data.section || "n/a";
  row.appendChild(sectionCell);

  // Wants Updates
  const updatesCell = document.createElement("td");
  updatesCell.textContent = data.wantsUpdates ? "Yes" : "No";
  row.appendChild(updatesCell);

  // Is Next Library
  const nextLibCell = document.createElement("td");
  nextLibCell.textContent = data.isNextLibrary ? "Yes" : "No";
  row.appendChild(nextLibCell);

  // Is Dokk1 Visitor
  const dokk1Cell = document.createElement("td");
  dokk1Cell.textContent = data.isDokk1Visitor ? "Yes" : "No";
  row.appendChild(dokk1Cell);

  // Is Other
  const otherCell = document.createElement("td");
  otherCell.textContent = data.isOther ? "Yes" : "No";
  row.appendChild(otherCell);

  // Other Text
  const otherTextCell = document.createElement("td");
  otherTextCell.textContent = data.otherText || "";
  row.appendChild(otherTextCell);

  // Timestamp
  const timestampCell = document.createElement("td");
  timestampCell.textContent = data.timestamp?.toDate().toLocaleString() || "n/a";
  row.appendChild(timestampCell);

  emailTbody.appendChild(row);
});


  // Logout handler
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

// Export as CSV(Email)
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

// Export as CSV(Messages)
window.exportMessageCSV = function () {
  const table = document.getElementById("messageTable");
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
  link.download = "message-data.csv";
  link.click();

  URL.revokeObjectURL(url);
};

