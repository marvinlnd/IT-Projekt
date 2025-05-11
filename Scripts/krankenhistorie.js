let krankenhistorie = ladeHistorie();


class krankheit{
    constructor(nameDerKrankheit, datumDerFeststellung){

        this.nameDerKrankheit = nameDerKrankheit;
        this.datumDerFeststellung = datumDerFeststellung;
    


    }

}


function speichereHistorie() {
  localStorage.setItem("krankenhistorie", JSON.stringify(krankenhistorie));
}

function ladeHistorie() {
  const gespeicherteDaten = localStorage.getItem("krankenhistorie");
  return gespeicherteDaten ? JSON.parse(gespeicherteDaten) : [];
}




function vorerkrankung_hinzufügen(nameDerKrankheit, datumDerFeststellung) {
  if (!validiereKrankheit(nameDerKrankheit, datumDerFeststellung)) {
    return;
  }
  const neueVorerkrankung = new krankheit(nameDerKrankheit, datumDerFeststellung);
  krankenhistorie.push(neueVorerkrankung);
  speichereHistorie();
  zeigeKrankenhistorieAlsTabelle();
  console.log("Erfolg");
  
}



function vorerkrankung_loeschen(index){

  if(index >= 0 && index < krankenhistorie.length){
    krankenhistorie.splice(index, 1);
    speichereHistorie();
    zeigeKrankenhistorieAlsTabelle();
  }
  else{
    console.log("Ungültige Eingabe");
  }


}

function vorerkrankung_bearbeiten(index, neuerName, neuesDatum) {
  if (!validiereKrankheit(neuerName, neuesDatum)) {
    return;
  }

  const eintrag = krankenhistorie[index];
  if (eintrag) {
    eintrag.nameDerKrankheit = neuerName;
    eintrag.datumDerFeststellung = neuesDatum;
    speichereHistorie();
    zeigeKrankenhistorieAlsTabelle();
    console.log("Eintrag bearbeitet:", eintrag);
  } else {
    console.log("Kein Eintrag gefunden");
  }
}



function zeigeKrankenhistorieAlsTabelle() {
  const tabelle = document.getElementById("krankenhistorieTabelle").getElementsByTagName("tbody")[0];
  tabelle.innerHTML = ""; 

  krankenhistorie.forEach((eintrag, index) => {
    const zeile = document.createElement("tr");

    const zelleIndex = document.createElement("td");
    zelleIndex.textContent = index;
    zeile.appendChild(zelleIndex);

    const zelleName = document.createElement("td");
    zelleName.textContent = eintrag.nameDerKrankheit;
    zeile.appendChild(zelleName);

    const zelleDatum = document.createElement("td");
    zelleDatum.textContent = eintrag.datumDerFeststellung;
    zeile.appendChild(zelleDatum);

    tabelle.appendChild(zeile);
  });
}

zeigeKrankenhistorieAlsTabelle();

