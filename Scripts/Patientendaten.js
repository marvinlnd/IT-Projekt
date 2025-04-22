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
    p.vorname,
    p.nachname,
    p.email,
    p.telefon,
    p.adresse,
    p.geburtsdatum
  ));
}

let patientListe = ladePatienten(); 

function speicherePatienten() {
  localStorage.setItem("patientListe", JSON.stringify(patientListe));
}

function patientHinzufuegen(vorname, nachname, email, telefon, adresse, geburtsdatum) {
  const neuerPatient = new Patient(vorname, nachname, email, telefon, adresse, geburtsdatum);
  patientListe.push(neuerPatient);
  speicherePatienten();
  return neuerPatient;
}

function patientBearbeiten(index, neueDaten) {
  if (index >= 0 && index < patientListe.length) {
    patientListe[index].aktualisieren(neueDaten);
    speicherePatienten();
  } else {
    console.log("Patient mit dem Index:" + index + " konnte nicht gefunden werden.\nBearbeiten fehlgeschlagen!");
  }
}

function patientLoeschen(index) {
  if (index >= 0 && index < patientListe.length) {
    patientListe.splice(index, 1);
    speicherePatienten();
    aktualisierePatiententabelle();
  } else {
    console.log("Patient mit dem Index:" + index + " konnte nicht gefunden werden.\nLöschen fehlgeschlagen!");
  }
}

function aktualisierePatiententabelle() {
  // Liste neu aus dem Speicher laden
  patientListe = ladePatienten();

  const tabelle = document.getElementById("patientenTabelle").querySelector("tbody");
  tabelle.innerHTML = "";
  patientListe.forEach((eintrag, index) => {
    const zeile = document.createElement("tr");
    zeile.innerHTML = `
      <td>${index}</td>
      <td>${eintrag.vorname}</td>
      <td>${eintrag.nachname}</td>
      <td>${eintrag.geburtsdatum}</td>
      <td>${eintrag.adresse}</td>
      <td>${eintrag.telefon}</td>
    `;
    tabelle.appendChild(zeile);
  });
}


aktualisierePatiententabelle();