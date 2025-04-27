// Validierung.js

function istNameGueltig(name) {
    // Name darf nur Buchstaben und evtl. Leerzeichen enthalten
    return /^[A-Za-zÄÖÜäöüß\s'-]+$/.test(name.trim());
  }
  
  function istEmailGueltig(email) {
    // Sehr einfache E-Mail-Überprüfung
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }
  
  function istTelefonnummerGueltig(telefon) {
    // Telefonnummer darf nur Ziffern, Leerzeichen, Bindestriche und Plus enthalten
    return /^[0-9+\s-]+$/.test(telefon.trim());
  }
  
  function istGeburtsdatumGueltig(datum) {
    // Format DD.MM.YYYY
    return /^\d{2}\.\d{2}\.\d{4}$/.test(datum.trim());
  }
  
  function sindPflichtfelderAusgefuellt(...felder) {
    // Keins der Felder darf leer sein
    return felder.every(feld => feld.trim() !== "");
  }
  
  function validierePatient(vorname, nachname, email, telefon, adresse, geburtsdatum) {
    if (!sindPflichtfelderAusgefuellt(vorname, nachname, email, telefon, adresse, geburtsdatum)) {
      alert("❌ Bitte alle Felder ausfüllen! ❌");
      return false;
    }
  
    if (!istNameGueltig(vorname) || !istNameGueltig(nachname)) {
      alert("❌ Vorname und Nachname dürfen nur Buchstaben enthalten! ❌");
      return false;
    }
  
    if (!istEmailGueltig(email)) {
      alert("❌ Bitte eine gültige E-Mail-Adresse eingeben! ❌");
      return false;
    }
  
    if (!istTelefonnummerGueltig(telefon)) {
      alert("❌ Telefonnummer darf nur Zahlen, Plus, Minus oder Leerzeichen enthalten! ❌");
      return false;
    }
  
    if (!istGeburtsdatumGueltig(geburtsdatum)) {
      alert("❌ Geburtsdatum muss im Format DD.MM.YYYY sein! ❌");
      return false;
    }
  
    return true;
  }
  
  function medikationHinzufuegen(medikament, anzahl, tageszeit, wochentage) {
    if (!medikament.trim() || !anzahl.trim() || !tageszeit.trim() || !wochentage.trim()) {
      alert("❗ Bitte alle Felder ausfüllen, bevor du eine Medikation hinzufügst.❗");
      return;
    }
  
    const neueMedikation = new Medikation(medikament, anzahl, tageszeit, wochentage);
    medikationsplan.push(neueMedikation);
    speichereMedikationsplan();
    aktualisiereTabelle();
  }
  
  function medikationBearbeiten(index, neueDaten) {
    if (isNaN(index) || index < 0 || index >= medikationsplan.length) {
      alert("❗ Ungültiger Index beim Bearbeiten!❗");
      return;
    }
  
    medikationsplan[index].aktualisieren(neueDaten);
    speichereMedikationsplan();
    aktualisiereTabelle();
  }
  
  function medikationLoeschen(index) {
    if (isNaN(index) || index < 0 || index >= medikationsplan.length) {
      alert("❗ Ungültiger Index beim Löschen!❗");
      return;
    }
  
    if (confirm("❓ Willst du diese Medikation wirklich löschen?❓")) {
      medikationsplan.splice(index, 1);
      speichereMedikationsplan();
      aktualisiereTabelle();
    }
  }
  