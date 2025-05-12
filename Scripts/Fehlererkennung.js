// #region Patienten Fehlererkennung

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
  
  
  function validierePatient(vorname, nachname, email, telefon, adresse, geburtsdatum) {
    if (!vorname || !nachname || !email || !telefon || !adresse || !geburtsdatum) {
      alert("❌Bitte füllen Sie alle Felder aus.❌");
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

  function istNameGueltig(neuerName) {
    // Name darf nur Buchstaben und evtl. Leerzeichen enthalten
    return /^[A-Za-zÄÖÜäöüß\s'-]+$/.test(neuerName.trim());
  }
  
  function istEmailGueltig(neueEmail) {
    // Sehr einfache E-Mail-Überprüfung
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(neueEmail.trim());
  }
  
  function istTelefonnummerGueltig(neuesTelefon) {
    // Telefonnummer darf nur Ziffern, Leerzeichen, Bindestriche und Plus enthalten
    return /^[0-9+\s-]+$/.test(neuesTelefon.trim());
  }
  
  function istGeburtsdatumGueltig(neuesGeburtsdatum) {
    // Format DD.MM.YYYY
    return /^\d{2}\.\d{2}\.\d{4}$/.test(neuesGeburtsdatum.trim());
  }
  function validiereBearbeitungsDaten(neuerVorname,neuerNachname,neueEmail,neuesTelefon,neueAdresse,neuesGeburtsdatum,) {
    if (!neuerVorname || !neuerNachname || !neueEmail || !neuesTelefon || !neueAdresse || !neuesGeburtsdatum) {
      alert("❌Bitte füllen Sie alle Felder aus.(Test 1)❌");
      return false;
    }
    if (!istNameGueltig(neuerVorname)) {
      alert("❌ Vorname darf nur Buchstaben enthalten!");
      return false;
    }
  
    if (!istNameGueltig(neuerNachname)) {
      alert("❌ Nachname darf nur Buchstaben enthalten!");
      return false;
    }
    alert("Hier");
    if (!istEmailGueltig(neueEmail)) {
      alert("❌ Bitte eine gültige E-Mail-Adresse eingeben!");
      return false;
    }
  
    if (!istTelefonnummerGueltig(neuesTelefon)) {
      alert("❌ Telefonnummer darf nur Zahlen, Plus, Minus oder Leerzeichen enthalten!");
      return false;
    }
  
    if (!istGeburtsdatumGueltig(neuesGeburtsdatum)) {
      alert("❌ Geburtsdatum muss im Format DD.MM.YYYY sein!");
      return false;
    }
  
    return true;
  }
  
 // #endregion
// #region Medikationsplan Fehlererkennung


 function istMedikamentenNameGueltig(name) {
    // Medikamentenname darf Buchstaben, Zahlen, Leerzeichen und Bindestriche enthalten
    return /^[A-Za-zÄÖÜäöüß0-9\s'-]+$/.test(name.trim());
  }
  
  function istAnzahlGueltig(anzahl) {
    // Anzahl darf jetzt Buchstaben, Zahlen, Leerzeichen und Sonderzeichen enthalten (z.B. "2 Tabletten", "1x täglich")
    return /^[A-Za-zÄÖÜäöüß0-9\s.,'-]+$/.test(anzahl.trim());
  }
  
  function istTageszeitGueltig(tageszeit) {
    // Tageszeit darf "morgens", "mittags", "abends", "nachts" oder Uhrzeiten wie 12:00 oder 20:00 Uhr sein
    const erlaubteBegriffe = ["morgens", "mittags", "abends", "nachts"];
    const uhrzeitFormat = /^\d{1,2}:\d{2}(\s*Uhr)?$/; // z.B. 12:00 oder 12:00 Uhr
    const eingabe = tageszeit.trim().toLowerCase();
  
    return erlaubteBegriffe.includes(eingabe) || uhrzeitFormat.test(eingabe);
  }
  
  function istWochentageGueltig(wochentage) {
    // Erlaubt ausgeschriebene Tage oder Abkürzungen, getrennt durch Kommas
    // Beispiele: "Montag, Mittwoch, Freitag" oder "Mo, Mi, Fr"
    return /^([A-Za-zÄÖÜäöüß]{2,10})(,\s*[A-Za-zÄÖÜäöüß]{2,10})*$/.test(wochentage.trim());
  }
  
  function sindPflichtfelderAusgefuellt(...felder) {
    // Keins der Felder darf leer sein
    return felder.every(feld => feld.trim() !== "");
  }
  
  function validiereMedikation(medikament, anzahl, tageszeit, wochentage) {
    if (!sindPflichtfelderAusgefuellt(medikament, anzahl, tageszeit, wochentage)) {
      alert("❌ Bitte alle Felder ausfüllen! ❌");
      return false;
    }
  
    if (!istMedikamentenNameGueltig(medikament)) {
      alert("❌ Medikamentenname darf nur Buchstaben, Zahlen, Leerzeichen und Bindestriche enthalten! ❌");
      return false;
    }
  
    if (!istAnzahlGueltig(anzahl)) {
      alert("❌ Anzahl darf Buchstaben und Zahlen enthalten, z.B. '2 Tabletten'! ❌");
      return false;
    }
  
    if (!istTageszeitGueltig(tageszeit)) {
      alert("❌ Tageszeit muss 'morgens', 'mittags', 'abends', 'nachts' oder eine Uhrzeit wie '12:00' sein! ❌");
      return false;
    }
  
    if (!istWochentageGueltig(wochentage)) {
      alert("❌ Wochentage müssen gültige Abkürzungen oder ausgeschriebene Namen enthalten, z.B. 'Mo, Mittwoch, Fr'! ❌");
      return false;
    }
  
    return true;
  }

  

  // #endregion
// #region Krankenhistorie Fehlererkennung

function istKrankheitsNameGueltig(name) {
  // Krankheitsname darf Buchstaben, Zahlen, Leerzeichen und Bindestriche enthalten
  return /^[A-Za-zÄÖÜäöüß0-9\s'-]+$/.test(name.trim());
}

function istFeststellungsdatumGueltig(datum) {
  // Datum muss im Format DD.MM.YYYY sein
  return /^\d{2}\.\d{2}\.\d{4}$/.test(datum.trim());
}

function sindPflichtfelderAusgefuellt(...felder) {
  // Keins der Felder darf leer sein
  return felder.every(feld => feld.trim() !== "");
}

function validiereKrankheit(name, datum) {
  if (!sindPflichtfelderAusgefuellt(name, datum)) {
    alert("❌ Bitte alle Felder ausfüllen! ❌");
    return false;
  }

  if (!istKrankheitsNameGueltig(name)) {
    alert("❌ Krankheitsname darf nur Buchstaben, Zahlen, Leerzeichen und Bindestriche enthalten! ❌");
    return false;
  }

  if (!istFeststellungsdatumGueltig(datum)) {
    alert("❌ Datum der Feststellung muss im Format DD.MM.YYYY sein! ❌");
    return false;
  }

  return true;
}

// #endregion

// #region Aktivitäten Fehlererkennung
function istAktivitaetsNameGueltig(name) {
  // Aktivitätsname darf Buchstaben, Zahlen, Leerzeichen und einfache Sonderzeichen enthalten
  return /^[A-Za-zÄÖÜäöüß0-9\s.,!?()/-]+$/.test(name.trim());
}

function istUhrzeitGueltig(uhrzeit) {
  // Uhrzeit im Format HH:MM, erlaubt 00:00 bis 23:59
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(uhrzeit.trim());
}

function validiereAktivitaet(name, beginn, ende, notiz) {
  if (!name || !beginn || !ende || !notiz) {
    alert("❌ Bitte füllen Sie alle Felder aus!");
    return false;
  }

  if (!istAktivitaetsNameGueltig(name)) {
    alert("❌ Der Name der Aktivität enthält ungültige Zeichen!");
    return false;
  }

  if (!istUhrzeitGueltig(beginn)) {
    alert("❌ Bitte geben Sie eine gültige Start-Uhrzeit im Format HH:MM ein!");
    return false;
  }

  if (!istUhrzeitGueltig(ende)) {
    alert("❌ Bitte geben Sie eine gültige End-Uhrzeit im Format HH:MM ein!");
    return false;
  }

  return true;
}

// #endregion