let krankenhistorie = ladeHistorie();


class krankheit{
    constructor(vitalwerte, allergien, vorerkrankungen){

        this.vitalwerte = vitalwerte;
        this.allergien = allergien;
        this.vorerkrankungen = vorerkrankungen;

    }

}


function speichereHistorie() {
  localStorage.setItem("krankenhistorie", JSON.stringify(krankenhistorie));
}

function ladeHistorie() {
  const gespeicherteDaten = localStorage.getItem("krankenhistorie");
  return gespeicherteDaten ? JSON.parse(gespeicherteDaten) : [];
}




function vorerkrankung_hinzufügen(vitalwerte, allergien, vorerkrankungen){

    const neueVorerkrankung = new krankheit(vitalwerte, allergien, vorerkrankungen);
    krankenhistorie.push(neueVorerkrankung);
    speichereHistorie();

}

function vorerkrankung_loeschen(index){

  if(index >= 0 && index < krankenhistorie.length){
    krankenhistorie.splice(index, 1);
  }
  else{
    console.log("Ungültige Eingabe");
  }


}

function vorerkrankung_bearbeiten(index, neueVitalwerte, neueAllergien, neueVorerkrankungen) {
  const eintrag = krankenhistorie[index];
  if (eintrag) {
    eintrag.vitalwerte = neueVitalwerte;
    eintrag.allergien = neueAllergien;
    eintrag.vorerkrankungen = neueVorerkrankungen;
    speichereHistorie();
    console.log("Eintrag bearbeitet:", eintrag);
  } else {
    console.log("Kein Eintrag gefunden");
  }
}

