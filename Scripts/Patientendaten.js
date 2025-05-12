class Patient {
  constructor(vorname, nachname, email, telefon, adresse, geburtsdatum) {
    this.vorname = vorname;
    this.nachname = nachname;
    this.email = email;
    this.telefon = telefon;
    this.adresse = adresse;
    this.geburtsdatum = geburtsdatum;
  }

  aktualisieren(neueDaten) {
    if (neueDaten.vorname !== undefined) this.vorname = neueDaten.vorname;
    if (neueDaten.nachname !== undefined) this.nachname = neueDaten.nachname;
    if (neueDaten.email !== undefined) this.email = neueDaten.email;
    if (neueDaten.telefon !== undefined) this.telefon = neueDaten.telefon;
    if (neueDaten.adresse !== undefined) this.adresse = neueDaten.adresse;
    if (neueDaten.geburtsdatum !== undefined) this.geburtsdatum = neueDaten.geburtsdatum;
  }
}

function ladePatienten() {
  const daten = localStorage.getItem("patientListe");
  if (!daten) return [];
  const rohDaten = JSON.parse(daten);
  return rohDaten.map(p => new Patient(
    p.vorname, p.nachname, p.email, p.telefon, p.adresse, p.geburtsdatum
  ));
}

let patientListe = ladePatienten();

function speicherePatienten() {
  localStorage.setItem("patientListe", JSON.stringify(patientListe));
}

function patientHinzufuegen(vorname, nachname, email, telefon, adresse, geburtsdatum) {
  if (!validierePatient(vorname, nachname, email, telefon, adresse, geburtsdatum)) {
    return;
  }

  const neuerPatient = new Patient(vorname, nachname, email, telefon, adresse, geburtsdatum);
  patientListe.push(neuerPatient);
  speicherePatienten();
  aktualisierePatiententabelle();
  return neuerPatient;
}

function patientBearbeiten(index, neueDaten) {
  if (index >= 0 && index < patientListe.length) {
    const aktuellerPatient = patientListe[index];

    // Leere Eingaben durch bestehende Werte ersetzen
    const vorname = neueDaten.vorname.trim() || aktuellerPatient.vorname;
    const nachname = neueDaten.nachname.trim() || aktuellerPatient.nachname;
    const email = neueDaten.email.trim() || aktuellerPatient.email;
    const telefon = neueDaten.telefon.trim() || aktuellerPatient.telefon;
    const adresse = neueDaten.adresse.trim() || aktuellerPatient.adresse;
    const geburtsdatum = neueDaten.geburtsdatum.trim() || aktuellerPatient.geburtsdatum;

    // Neue Funktion verwenden
    if (!validiereBearbeitungsDaten(vorname, nachname, email, telefon, adresse, geburtsdatum)) {
      alert("Valiedierung klappt");
      return;
    }

    // Aktualisieren
    patientListe[index].aktualisieren({
      vorname, nachname, email, telefon, adresse, geburtsdatum
    });

    speicherePatienten();
    aktualisierePatiententabelle();
  } else {
    alert(`❌ Patient mit dem Index ${index} konnte nicht gefunden werden.`);
  }
}

function patientLoeschen(index) {
  if (isNaN(index) || index < 0 || index >= patientListe.length) {
      alert("❗ Ungültiger Index beim Löschen!❗");
      return;
    }
  if (confirm("❓ Willst du diesen Patienten wirklich löschen?❓")) {
      patientListe.splice(index, 1)
      speicherePatienten();
    aktualisierePatiententabelle();
      
  }
}



function aktualisierePatiententabelle() {
  patientListe = ladePatienten();
  const tabelle = document.getElementById("patientenTabelle").querySelector("tbody");
  tabelle.innerHTML = "";

  patientListe.forEach((eintrag, index) => {
    const zeile = document.createElement("tr");
    zeile.innerHTML = `
      <td>${index}</td>
      <td>${eintrag.vorname}</td>
      <td>${eintrag.nachname}</td>
      <td>${eintrag.email}</td>
      <td>${eintrag.geburtsdatum}</td>
      <td>${eintrag.adresse}</td>
      <td>${eintrag.telefon}</td>
    `;
    tabelle.appendChild(zeile);
  });

  aktualisiereDropdowns();
}

function aktualisiereDropdowns() {
  const bearbeitungsDropdown = document.getElementById("patientIndex");
  const loeschDropdown = document.getElementById("indexLoeschen");

  bearbeitungsDropdown.innerHTML = "";
  loeschDropdown.innerHTML = "";

  if (patientListe.length === 0) {
    const optionKeinePatienten = document.createElement("option");
    optionKeinePatienten.textContent = "Keine Patienten vorhanden";
    optionKeinePatienten.disabled = true;
    bearbeitungsDropdown.appendChild(optionKeinePatienten);
    loeschDropdown.appendChild(optionKeinePatienten.cloneNode(true));
    return;
  }

  patientListe.forEach((patient, index) => {
    const optionBearbeiten = document.createElement("option");
    optionBearbeiten.value = index;
    optionBearbeiten.textContent = `${index} – ${patient.vorname} ${patient.nachname}`;
    bearbeitungsDropdown.appendChild(optionBearbeiten);

    const optionLoeschen = document.createElement("option");
    optionLoeschen.value = index;
    optionLoeschen.textContent = `${index} – ${patient.vorname} ${patient.nachname}`;
    loeschDropdown.appendChild(optionLoeschen);
  });
}

aktualisierePatiententabelle();
