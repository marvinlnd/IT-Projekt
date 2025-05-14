let aktivitäten = ladeAktivitäten();

class aktivität {
  constructor(nameDerAktivität, beginn, ende, notitz) {
    this.nameDerAktivität = nameDerAktivität;
    this.beginn = beginn;
    this.ende = ende;
    this.notitz = notitz;
  }
}

function speichereAktivität() {
  localStorage.setItem("aktivitäten", JSON.stringify(aktivitäten));
}

function ladeAktivitäten() {
  const gespeicherteDaten = localStorage.getItem("aktivitäten");
  return gespeicherteDaten ? JSON.parse(gespeicherteDaten) : [];
}

function aktivitätHinzufügen(nameDerAktivität, beginn, ende, notitz) {
  if (!validiereAktivitaet(nameDerAktivität, beginn, ende, notitz)) return;

  const neueAktivität = new aktivität(nameDerAktivität, beginn, ende, notitz);
  aktivitäten.push(neueAktivität);
  speichereAktivität();
  console.log("Erfolg");
}

function aktivität_loeschen(index) {
  if (isNaN(index) || index < 0 || index >= aktivitäten.length) {
      alert("❗ Ungültiger Index beim Löschen!❗");
      return;
    }
  if (confirm("❓ Willst du diese Aktivität wirklich löschen?❓")) {
      aktivitäten.splice(index, 1);
      speichereAktivität();
      aktualisiereTabelle();
      
  }
}

function aktivität_bearbeiten(index, neuerName, neuBeginn, neuEnde, neueNotitz) {
  if (!validiereAktivitaet(neuerName, neuBeginn, neuEnde, neueNotitz)) return;

  const eintrag = aktivitäten[index];
  if (eintrag) {
    eintrag.nameDerAktivität = neuerName;
    eintrag.beginn = neuBeginn;
    eintrag.ende = neuEnde;
    eintrag.notitz = neueNotitz;
    speichereAktivität();
    console.log("Eintrag bearbeitet:", eintrag);
  } else {
    console.log("Kein Eintrag gefunden");
  }
}

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

// Tabelle direkt beim Laden aktualisieren
aktualisiereTabelle();

// Tabelle bei Hinzufügen, Bearbeiten, Löschen ebenfalls aktualisieren
const originalHinzufügen = aktivitätHinzufügen;
aktivitätHinzufügen = function (...args) {
  originalHinzufügen(...args);
  aktualisiereTabelle();
};

const originalBearbeiten = aktivität_bearbeiten;
aktivität_bearbeiten = function (...args) {
  originalBearbeiten(...args);
  aktualisiereTabelle();
};

const originalLoeschen = aktivität_loeschen;
aktivität_loeschen = function (...args) {
  originalLoeschen(...args);
  aktualisiereTabelle();
};
