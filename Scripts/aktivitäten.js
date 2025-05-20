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

// Klasse für Aktivitäten
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
    const snapshot = await db.collection("Activities").get();
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
    beginn: beginn,
    ende: ende,
    notitz: notitz
  };

  try {
    const docRef = await db.collection("Activities").add(neueAktivität);
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
      await db.collection("Activities").doc(eintrag.id).delete();
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
    await db.collection("Activities").doc(eintrag.id).set(aktualisiert);
    console.log("✅ Aktivität in Firestore aktualisiert:", eintrag.id);
    await ladeAktivitäten();
  } catch (error) {
    console.error("❌ Fehler beim Aktualisieren:", error);
  }
}

// Tabelle aktualisieren
function aktualisiereTabelle() {
  const tbody = document.querySelector("#aktivitätenTabelle tbody");
  tbody.innerHTML = "";

  aktivitäten.forEach((eintrag, index) => {
    const zeile = document.createElement("tr");
    zeile.innerHTML = `
      <td>${index}</td>
      <td>${eintrag.nameDerAktivität}</td>
      <td>${eintrag.beginn}</td>
      <td>${eintrag.ende}</td>
      <td>${eintrag.notitz}</td>
    `;
    tbody.appendChild(zeile);
  });
}

// Gültigkeit prüfen (Hilfsfunktion – muss von dir oder separat definiert sein)
function validiereAktivitaet(name, beginn, ende, notitz) {
  if (!name || !beginn || !ende) {
    alert("Bitte alle Pflichtfelder ausfüllen!");
    return false;
  }
  return true;
}

// Beim Laden initiale Daten holen
document.addEventListener("DOMContentLoaded", ladeAktivitäten);
