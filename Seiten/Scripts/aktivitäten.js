// aktivitäten.js

// Firebase initialisieren
const firebaseConfig = {
  apiKey: "AIzaSyAakpWbT87pJ4Bv1Xr0Mk2lCNhNols7KR4",
  authDomain: "it-projekt-ffc4d.firebaseapp.com",
  projectId: "it-projekt-ffc4d",
  storageBucket: "it-projekt-ffc4d.appspot.com",
  messagingSenderId: "534546734981",
  appId: "1:534546734981:web:13bffd7c78893bd0e3aeec"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
console.log("✅ Firebase für Aktivitäten initialisiert!");

const userId = localStorage.getItem("user-id");

class Aktivität {
  constructor(nameDerAktivität, beginn, ende, notitz) {
    this.nameDerAktivität = nameDerAktivität;
    this.beginn = beginn;
    this.ende = ende;
    this.notitz = notitz;
  }
}

let aktivitäten = [];

// Daten aus Firestore laden
async function ladeAktivitäten() {
  try {
    const snapshot = await db.collection('users').doc(userId).collection('aktivitäten').get();
    aktivitäten = [];
    snapshot.forEach(doc => {
      const eintrag = doc.data();
      aktivitäten.push({ id: doc.id, ...eintrag });
    });
    console.log(`✅ ${aktivitäten.length} Aktivitäten aus der Datenbank geladen.`);
    aktualisiereTabelle();
  } catch (error) {
    console.error("❌ Fehler beim Laden der Aktivitäten:", error);
  }
}

// Neue Aktivität hinzufügen
async function aktivitätHinzufügen(name, beginn, ende, notitz) {
  if (!validiereAktivitaet(name, beginn, ende, notitz)) return;

  const neueAktivität = {
    nameDerAktivität: name,
    beginn,
    ende,
    notitz
  };

  try {
    const docRef = await db.collection('users').doc(userId).collection('aktivitäten').add(neueAktivität);
    console.log("✅ Aktivität hinzugefügt:", docRef.id);
    await ladeAktivitäten();
  } catch (error) {
    console.error("❌ Fehler beim Speichern der Aktivität:", error);
  }
}

// Aktivität löschen
async function aktivität_loeschen(index) {
  const eintrag = aktivitäten[index];
  if (!eintrag || !eintrag.id) {
    alert("❗ Ungültiger Index oder fehlende ID beim Löschen!");
    return;
  }

  if (confirm("❓ Willst du diese Aktivität wirklich löschen?❓")) {
    try {
      await db.collection("users").doc(userId).collection("aktivitäten").doc(eintrag.id).delete();
      console.log("✅ Aktivität aus Firestore gelöscht:", eintrag.id);
      await ladeAktivitäten();
    } catch (error) {
      console.error("❌ Fehler beim Löschen:", error);
    }
  }
}

// Aktivität bearbeiten
async function aktivität_bearbeiten(index, neuerName, neuBeginn, neuEnde, neueNotitz) {
  if (!validiereAktivitaet(neuerName, neuBeginn, neuEnde, neueNotitz)) return;

  const eintrag = aktivitäten[index];
  if (!eintrag || !eintrag.id) {
    console.warn("❗ Keine gültige Aktivität zum Bearbeiten gefunden.");
    return;
  }

  const aktualisiert = {
    nameDerAktivität: neuerName,
    beginn: neuBeginn,
    ende: neuEnde,
    notitz: neueNotitz
  };

  try {
    await db.collection("users").doc(userId).collection("aktivitäten").doc(eintrag.id).set(aktualisiert);
    console.log("✅ Aktivität in Firestore aktualisiert:", eintrag.id);
    await ladeAktivitäten();
  } catch (error) {
    console.error("❌ Fehler beim Aktualisieren:", error);
  }
}

// Tabelle aktualisieren & Zeilen klickbar machen
function aktualisiereTabelle() {
  const tbody = document.querySelector("#aktivitätenTabelle tbody");
  tbody.innerHTML = "";

  aktivitäten.forEach((eintrag, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${index}</td>
      <td>${eintrag.nameDerAktivität}</td>
      <td>${eintrag.beginn}</td>
      <td>${eintrag.ende}</td>
      <td>${eintrag.notitz}</td>
    `;

    row.addEventListener("click", event => {
      // a) Highlight the selected row
      tbody.querySelectorAll("tr").forEach(r => r.classList.remove("selected"));
      row.classList.add("selected");

      // b) Position and show context menu
      const menu = document.getElementById("context-menu");
      menu.style.display = "block";
      menu.style.left = `${event.pageX + 5}px`;
      menu.style.top  = `${event.pageY + 5}px`;

      // c) Edit-Button → open modal
      document.getElementById("edit-button").onclick = () => {
        const modal     = document.getElementById("edit-modal-overlay");
        const nameIn    = document.getElementById("modal-name");
        const beginnIn  = document.getElementById("modal-beginn");
        const endeIn    = document.getElementById("modal-ende");
        const noteIn    = document.getElementById("modal-Notiz");
        const saveBtn   = document.getElementById("modal-save");
        const cancelBtn = document.getElementById("modal-cancel");

        // fill current values
        nameIn.value   = eintrag.nameDerAktivität;
        beginnIn.value = eintrag.beginn;
        endeIn.value   = eintrag.ende;
        noteIn.value   = eintrag.notitz;

        modal.style.display = "flex";
        menu.style.display  = "none";

        saveBtn.onclick = async () => {
          // call your edit function
          await aktivität_bearbeiten(
            index,
            nameIn.value,
            beginnIn.value,
            endeIn.value,
            noteIn.value
          );
          modal.style.display = "none";
        };
        cancelBtn.onclick = () => {
          modal.style.display = "none";
        };
      };

      // d) Delete-Button → delete entry
      document.getElementById("delete-button").onclick = async () => {
        await aktivität_loeschen(index);
        menu.style.display = "none";
      };
    });

    tbody.appendChild(row);
  });
}


// Validierung
function validiereAktivitaet(name, beginn, ende, notitz) {
  if (!name || !beginn || !ende) {
    alert("Bitte alle Pflichtfelder ausfüllen!");
    return false;
  }
  return true;
}

// Initiales Laden
document.addEventListener("DOMContentLoaded", ladeAktivitäten);

document.addEventListener('click', (e) => {
  const menu = document.getElementById('context-menu');
  if (!menu.contains(e.target) && !e.target.closest('tr')) {
    menu.style.display = 'none';
  }
});