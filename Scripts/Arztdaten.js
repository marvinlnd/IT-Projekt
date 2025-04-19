let arztListe = ladeAerzte();

class Arzt {
  constructor(vorname, nachname, email, telefon, adresse, fachbereich) {
    this.vorname = vorname;
    this.nachname = nachname;
    this.email = email;
    this.telefon = telefon;
    this.adresse = adresse;
    this.fachbereich = fachbereich;
  }

  aktualisieren(neueDaten) {
    if (neueDaten.vorname !== undefined) this.vorname = neueDaten.vorname;
    if (neueDaten.nachname !== undefined) this.nachname = neueDaten.nachname;
    if (neueDaten.email !== undefined) this.email = neueDaten.email;
    if (neueDaten.telefon !== undefined) this.telefon = neueDaten.telefon;
    if (neueDaten.adresse !== undefined) this.adresse = neueDaten.adresse;
    if (neueDaten.fachbereich !== undefined) this.fachbereich = neueDaten.fachbereich;
  }
}

function ladeAerzte() {
  const daten = localStorage.getItem("arztListe");
  return daten ? JSON.parse(daten) : [];
}

function speichereAerzte() {
  localStorage.setItem("arztListe", JSON.stringify(arztListe));
}

function arztHinzufuegen(vorname, nachname, email, telefon, adresse, fachbereich) {
  const neuerArzt = new Arzt(vorname, nachname, email, telefon, adresse, fachbereich);
  arztListe.push(neuerArzt);
  speichereAerzte();
  return neuerArzt;
}

function arztBearbeiten(index, neueDaten) {
  if (index >= 0 && index < arztListe.length) {
    arztListe[index].aktualisieren(neueDaten);
    speichereAerzte();
  } else {
    console.log("Arzt mit dem Index:" + index + " konnte nicht gefunden werden.\nBearbeiten fehlgeschlagen!");
  }
}

function arztLoeschen(index) {
  if (index >= 0 && index < arztListe.length) {
    arztListe.splice(index, 1);
    speichereAerzte();
  } else {
    console.log("Arzt mit dem Index:" + index + " konnte nicht gefunden werden.\nLöschen fehlgeschlagen!");
  }
}
