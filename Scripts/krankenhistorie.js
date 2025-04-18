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




function vorerkrankung_hinzufügen(nameDerKrankheit, datumDerFeststellung){

    const neueVorerkrankung = new krankheit(nameDerKrankheit, datumDerFeststellung);
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

function vorerkrankung_bearbeiten(index, neuerName, neuesDatum) {
  const eintrag = krankenhistorie[index];
  if (eintrag) {
    eintrag.nameDerKrankheit = neuerName;
    eintrag.datumDerFeststellung = neuesDatum;
    speichereHistorie();
    console.log("Eintrag bearbeitet:", eintrag);
  } else {
    console.log("Kein Eintrag gefunden");
  }
}

