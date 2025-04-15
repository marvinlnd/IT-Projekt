class krankheit{
    constructor(vitalwerte, allergien, vorerkrankungen){

        this.vitalwerte = vitalwerte;
        this.allergien = allergien;
        this.vorerkrankungen = vorerkrankungen;

    }

}



    const krankenhistorie = [];

function vorerkrankung_hinzufügen(vitalwerte, allergien, vorerkrankungen){

    const neueVorerkrankung = new krankheit(vitalwerte, allergien, vorerkrankungen);
    krankenhistorie.push(neueVorerkrankung);

}

function vorerkrankung_loeschen(){

}

function vorerkrankung_bearbeiten(krankheit, neueVitalwerte, neueAllergien, neueVorerkrankungen) {
    if (krankheit instanceof krankheit) {
      krankheit.vitalwerte = neueVitalwerte;
      krankheit.allergien = neueAllergien;
      krankheit.vorerkrankungen = neueVorerkrankungen;
    } else {
      console.log("Ungültiges Objekt");
    }
  }
