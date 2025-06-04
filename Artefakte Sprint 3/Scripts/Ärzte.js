// Firebase-Konfiguration (ersetzen mit deinen Projektdaten!)
const firebaseConfig = {
  apiKey: "AIzaSyAakpWbT87pJ4Bv1Xr0Mk2lCNhNols7KR4",
  authDomain: "it-projekt-ffc4d.firebaseapp.com",
  projectId: "it-projekt-ffc4d",
  storageBucket: "it-projekt-ffc4d.firebasestorage.app",
  messagingSenderId: "534546734981",
  appId: "1:534546734981:web:13bffd7c78893bd0e3aeec"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const arztRef = db.collection("ärzte");

// DOM-Elemente
const tabelle = document.querySelector("#arztTabelle tbody");
const indexDropdown = document.getElementById("indexDropdown");
const indexLoeschenDropdown = document.getElementById("indexLoeschenDropdown");

// Daten abrufen und anzeigen
function ladeDaten() {
  arztRef.get().then(snapshot => {
    const tbody = document.querySelector("#arztTabelle tbody");
    tbody.innerHTML = "";

    snapshot.docs.forEach((doc, index) => {
      const daten = doc.data();

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${index}</td>
        <td>${daten.name}</td>
        <td>${daten.fach}</td>
        <td>${daten.email}</td>
        <td>${daten.telefon}</td>
        <td>${daten.adresse}</td>
      `;

      row.addEventListener("click", () => {
        // Markierung der gewählten Zeile
        tbody.querySelectorAll("tr").forEach(r => r.classList.remove("selected"));
        row.classList.add("selected");

        // Felder zum Bearbeiten füllen
        document.getElementById("neuerArztname").value = daten.name || "";
        document.getElementById("neueFach").value = daten.fach || "";
        document.getElementById("neueEMail").value = daten.email || "";
        document.getElementById("neueTelefonnummer").value = daten.telefon || "";
        document.getElementById("neueAdresse").value = daten.adresse || "";

        // Dokument-ID für spätere Bearbeitung/Löschung zwischenspeichern
        document.getElementById("indexDropdown").value = doc.id;
        document.getElementById("indexLoeschenDropdown").value = doc.id;
      });

      tbody.appendChild(row);

      // Dropdowns mit IDs aktualisieren
      const option = new Option(`${daten.name} (${index})`, doc.id);
      document.getElementById("indexDropdown").appendChild(option);
      document.getElementById("indexLoeschenDropdown").appendChild(option.cloneNode(true));
    });

    console.log(`✅ ${snapshot.size} Ärzte geladen.`);
  }).catch(error => {
    console.error("❌ Fehler beim Laden der Daten:", error);
  });
}


// Arzt hinzufügen
document.getElementById("add-med").addEventListener("click", () => {
  const name = document.getElementById("arztname").value;
  const fach = document.getElementById("fach").value;
  const email = document.getElementById("eMail").value;
  const telefon = document.getElementById("Telefonnummer").value;
  const adresse = document.getElementById("Adresse").value;

  if (name && fach) {
    arztRef.add({ name, fach, email, telefon, adresse }).then(ladeDaten);
  }
});

// Arzt bearbeiten
document.getElementById("edit-med").addEventListener("click", () => {
  const docId = indexDropdown.value;
  const name = document.getElementById("neuerArztname").value;
  const fach = document.getElementById("neueFach").value;
  const email = document.getElementById("neueEMail").value;
  const telefon = document.getElementById("neueTelefonnummer").value;
  const adresse = document.getElementById("neueAdresse").value;

  if (docId) {
    arztRef.doc(docId).update({
      ...(name && { name }),
      ...(fach && { fach }),
      ...(email && { email }),
      ...(telefon && { telefon }),
      ...(adresse && { adresse })
    }).then(ladeDaten);
  }
});

// Arzt löschen
document.getElementById("delete-arzt").addEventListener("click", () => {
  const docId = indexLoeschenDropdown.value;
  if (docId) {
    arztRef.doc(docId).delete().then(ladeDaten);
  }
});

// Alle löschen
document.getElementById("clear-med").addEventListener("click", () => {
  arztRef.get().then(snapshot => {
    const batch = db.batch();
    snapshot.docs.forEach(doc => batch.delete(doc.ref));
    return batch.commit();
  }).then(ladeDaten);
});

// Nach dem Laden Daten holen
document.addEventListener("DOMContentLoaded", ladeDaten);
