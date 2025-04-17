
let kontaktListe = ladeKontakte();

class Kontakt {
  constructor(vorname, nachname, email, telefon, adresse, fachbereich) {
    this.vorname = vorname;
    this.nachname = nachname;
    this.email = email;
    this.telefon = telefon;
    this.adresse = adresse;
    this.fachbreich = fachbereich;
  }

  aktualisieren(neueDaten) {
    if (neueDaten.vorname !== undefined) this.vorname = neueDaten.vorname;
    if (neueDaten.nachname !== undefined) this.nachname = neueDaten.nachname;
    if (neueDaten.email !== undefined) this.email = neueDaten.email;
    if (neueDaten.telefon !== undefined) this.telefon = neueDaten.telefon;
    if (neueDaten.adresse !== undefined) this.adresse = neueDaten.adresse;
    if (neueDaten.adresse !== undefined) this.fachbereich = neueDaten.fachbereich;
  }
}

function ladeKontakte() {
  const daten = localStorage.getItem("kontaktListe");
  return daten ? JSON.parse(daten) : [];
}

function speichereKontakte() {
  localStorage.setItem("kontaktListe", JSON.stringify(kontaktListe));
}

function kontaktHinzufuegen(vorname, nachname, email, telefon, adresse, fachbreich) {
  const neuerKontakt = new Kontakt(vorname, nachname, email, telefon, adresse, fachbreich);
  kontaktListe.push(neuerKontakt);
  speichereKontakte();
  return neuerKontakt;
}

function kontaktBearbeiten(index, neueDaten) {
  if (index >= 0 && index < kontaktListe.length) {
    kontaktListe[index].aktualisieren(neueDaten);
    speichereKontakte();
  } else {
    console.log("Kontakt konnte nicht gefunden werden! \n Bearbeiten Fehlgeschlagen!");
  }
}

function kontaktLoeschen(index) {
  if (index >= 0 && index < kontaktListe.length) {
    kontaktListe.splice(index, 1);
    speichereKontakte();
  } else {
    console.log("Kontakt konnte nicht gefunden werden! \n Löschen Fehlgeschlagen!");
  }
}
