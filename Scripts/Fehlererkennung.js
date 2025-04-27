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
  