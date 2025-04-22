class Medikation {
    constructor(medikament, anzahl, tageszeit, wochentage) {
      this.medikament = medikament;
      this.anzahl = anzahl;
      this.tageszeit = tageszeit;
      this.wochentage = wochentage; 
    }
  
    aktualisieren(neueDaten) {
      if (neueDaten.medikament !== undefined) this.medikament = neueDaten.medikament;
      if (neueDaten.anzahl !== undefined) this.anzahl = neueDaten.anzahl;
      if (neueDaten.tageszeit !== undefined) this.tageszeit = neueDaten.tageszeit;
      if (neueDaten.wochentage !== undefined) this.wochentage = neueDaten.wochentage;
    }
  }
  
  let medikationsplan = ladeMedikationsplan();
  
  function ladeMedikationsplan() {
    const daten = localStorage.getItem("medikationsplan");
    return daten ? JSON.parse(daten) : [];
  }
  
  function speichereMedikationsplan() {
    localStorage.setItem("medikationsplan", JSON.stringify(medikationsplan));
  }
  
  function medikationHinzufuegen(medikament, anzahl, tageszeit, wochentage) {
    const neueMedikation = new Medikation(medikament, anzahl, tageszeit, wochentage);
    medikationsplan.push(neueMedikation);
    speichereMedikationsplan();
    return neueMedikation;
  }
  
  function medikationBearbeiten(index, neueDaten) {
    if (index >= 0 && index < medikationsplan.length) {
      medikationsplan[index].aktualisieren(neueDaten);
      speichereMedikationsplan();
    } else {
      console.log("Medikation mit dem Index:"+ index + "konnte nicht gefunden werden. \n Bearbeiten Fehlgeschlagen!");
    }
  }
  
  function medikationLoeschen(index) {
    if (index >= 0 && index < medikationsplan.length) {
      medikationsplan.splice(index, 1);
      speichereMedikationsplan();
    } else {
      console.log("Medikation mit dem Index:"+ index + "konnte nicht gefunden werden. \n Löschen Fehlgeschlagen!");
    }
  }
  
  function aktualisiereTabelle() {
    const tabelle = document.getElementById("medikationsTabelle").querySelector("tbody");
    tabelle.innerHTML = "";
    medikationsplan.forEach((eintrag, index) => {
      const zeile = document.createElement("tr");
      zeile.innerHTML = `
        <td>${index}</td>
        <td>${eintrag.medikament}</td>
        <td>${eintrag.anzahl}</td>
        <td>${eintrag.tageszeit}</td>
        <td>${eintrag.wochentage}</td>
      `;
      tabelle.appendChild(zeile);
    });
  }
  
  window.onload = aktualisiereTabelle;
  