let aktivitäten = ladeAktivität();


class aktivität{
    constructor(nameDerAktivität, beginn, ende, notitz){

        this.nameDerAktivität = nameDerAktivität;
        this.beginn = beginn;
        this.ende = ende;
        this.notitz = notitz;

    }

}


function speichereAktivität() {
  localStorage.setItem("aktivitäten", JSON.stringify(aktivitäten));
}

function ladeAktivitäten() {
  const gespeicherteDaten = localStorage.getItem("aktivitäten");
  return gespeicherteDaten ? JSON.parse(gespeicherteDaten) : [];
}




function aktivitätHinzufügen(nameDerAktivität, beginn, ende, notitz){



    const neueAktivität = new aktivität(nameDerAktivität, beginn, ende, notitz);
    aktivität.push(neueAktivität);
    speichereAktivität();
    console.log("Erfolg");

}

function aktivität_loeschen(index){

  if(index >= 0 && index < aktivität.length){
    aktivität.splice(index, 1);
    speichereAktivität();
  }
  else{
    console.log("Ungültige Eingabe");
  }


}

function aktivität_bearbeiten(index, neuerName, neuBeginn, neuEnde, neueNotitz) {
  const eintrag = aktivität[index];
  if (eintrag) {
    eintrag.neueAktivität = neuerName;
    eintrag.beginn = neuBeginn;
    eintrag.ende = neuEnde;
    eintrag.notitz = neueNotitz;
    speichereAktivität();
    console.log("Eintrag bearbeitet:", eintrag);
  } else {
    console.log("Kein Eintrag gefunden");
  }
}

