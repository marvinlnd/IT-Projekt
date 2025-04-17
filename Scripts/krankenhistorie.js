const krankenhistorie = [];



class krankheit{
    constructor(vitalwerte, allergien, vorerkrankungen){

        this.vitalwerte = vitalwerte;
        this.allergien = allergien;
        this.vorerkrankungen = vorerkrankungen;

    }

}




function vorerkrankung_hinzufügen(vitalwerte, allergien, vorerkrankungen){

    const neueVorerkrankung = new krankheit(vitalwerte, allergien, vorerkrankungen);
    krankenhistorie.push(neueVorerkrankung);

}

function vorerkrankung_loeschen(index){

  if(index >= 0 && index < krankenhistorie.length){
    krankenhistorie.splice(index, 1);
  }
  else{
    console.log("Ungültige Eingabe");
  }


}

function vorerkrankung_bearbeiten(krankheit, neueVitalwerte, neueAllergien, neueVorerkrankungen) {

  fehlermeldung = "Vorerkrankung nicht vorhanden";
    if (krankheit instanceof krankheit) {
      krankheit.vitalwerte = neueVitalwerte;
      krankheit.allergien = neueAllergien;
      krankheit.vorerkrankungen = neueVorerkrankungen;
    } else {
      console.log(fehlermeldung);
    }
  }
