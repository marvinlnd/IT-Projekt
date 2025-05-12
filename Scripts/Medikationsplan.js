let medikationsplan = ladeMedikationsplan();


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
  
  
  
function ladeMedikationsplan() {
    const daten = localStorage.getItem("medikationsplan");
    return daten ? JSON.parse(daten) : [];
}
  
function speichereMedikationsplan() {
    localStorage.setItem("medikationsplan", JSON.stringify(medikationsplan));
}
  
function medikationHinzufuegen(medikament, anzahl, tageszeit, wochentage) {
  if (!validiereMedikation(medikament, anzahl, tageszeit, wochentage)) return;

  const neueMedikation = new Medikation(medikament, anzahl, tageszeit, wochentage);
  medikationsplan.push(neueMedikation);
  speichereMedikationsplan();
  aktualisiereTabelle();
  aktualisiereIndexDropdown();
  return neueMedikation;
}

  
function medikationBearbeiten(index, neueDaten) {
  if (index < 0 || index >= medikationsplan.length) {
    alert("❗ Ungültiger Index beim Bearbeiten! ❗");
    return;
  }

  const { medikament, anzahl, tageszeit, wochentage } = neueDaten;
  if (!validiereMedikation(medikament, anzahl, tageszeit, wochentage)) return;

  medikationsplan[index].aktualisieren(neueDaten);
  speichereMedikationsplan();
  aktualisiereTabelle();
  aktualisiereIndexDropdown();
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
      aktualisiereIndexDropdown();
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
function aktualisiereIndexDropdown() {
    const indexDropdown = document.getElementById('indexDropdown');
    const indexLoeschenDropdown = document.getElementById('indexLoeschenDropdown');
  
    // Leeren der Dropdowns
    indexDropdown.innerHTML = '';
    indexLoeschenDropdown.innerHTML = '';
  
    // Hinzufügen der Optionen zum Dropdown für Bearbeitung und Löschen
    medikationsplan.forEach((medikation, index) => {
      const option = document.createElement('option');
      option.value = index;
      option.textContent = `${index + 1}: ${medikation.medikament}`;
      
      indexDropdown.appendChild(option);
      indexLoeschenDropdown.appendChild(option.cloneNode(true));  // Das gleiche Element für das Löschen-Dropdown
    });
    if (indexDropdown.options.length > 0) {
  indexDropdown.selectedIndex = 0;
}
if (indexLoeschenDropdown.options.length > 0) {
  indexLoeschenDropdown.selectedIndex = 0;
}

}
  
  // Diese Funktion nach jedem Hinzufügen, Bearbeiten oder Löschen von Medikation aufrufen:
aktualisiereIndexDropdown();
  
window.onload = () => {
  aktualisiereTabelle();
  aktualisiereIndexDropdown();
};

  