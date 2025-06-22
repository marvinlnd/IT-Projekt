// Login-Pop-up Menü: nur die erforderlichen Zeilen

// Elemente selektieren
const loginIcon = document.getElementById('login-icon');
const loginMenu = document.getElementById('login-menu');

// Klick auf das Icon: Menü ein-/ausblenden
loginIcon.addEventListener('click', e => {
  e.stopPropagation();
  const isOpen = loginMenu.classList.toggle('open');
  loginMenu.setAttribute('aria-hidden', !isOpen);
  loginIcon.setAttribute('aria-expanded', isOpen);
});

// Klick außerhalb: Menü schließen
document.addEventListener('click', e => {
  if (!loginIcon.contains(e.target) && !loginMenu.contains(e.target)) {
    loginMenu.classList.remove('open');
    loginMenu.setAttribute('aria-hidden', 'true');
    loginIcon.setAttribute('aria-expanded', 'false');
  }
});

// Menü schließt sich auch, wenn ein Link angeklickt wird
loginMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    loginMenu.classList.remove('open');
    loginMenu.setAttribute('aria-hidden', 'true');
    loginIcon.setAttribute('aria-expanded', 'false');
  });
});

// Firebase-Konfiguration (ersetzen mit deinen Projektdaten!)
const firebaseConfig = {
  apiKey: "AIzaSyAakpWbT87pJ4Bv1Xr0Mk2lCNhNols7KR4",
  authDomain: "it-projekt-ffc4d.firebaseapp.com",
  projectId: "it-projekt-ffc4d",
  storageBucket: "it-projekt-ffc4d.firebasestorage.app",
  messagingSenderId: "534546734981",
  appId: "1:534546734981:web:13bffd7c78893bd0e3aeec"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
console.log("✅ Firebase initialisiert!");

const arztRef = db.collection("ärzte");
const userId = localStorage.getItem("user-id");
let aktuelleArztId = null;

class Arzt {
  constructor(name, fach, email, telefon, adresse) {
    this.name = name;
    this.fach = fach;
    this.email = email;
    this.telefon = telefon;
    this.adresse = adresse;
  }

  aktualisieren(data) {
    if (data.name !== undefined) this.name = data.name;
    if (data.fach !== undefined) this.fach = data.fach;
    if (data.email !== undefined) this.email = data.email;
    if (data.telefon !== undefined) this.telefon  = data.telefon;
    if (data.adresse !== undefined) this.adresse = data.adresse;
  }
}

const STORAGE_KEY = 'patientListe';

function ladePatienten() {
  const data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  data.forEach(p => {
    if (Array.isArray(p.arzt)) {
      p.arzt = p.arzt.map(a => new Arzt(a.name, a.fach, a.email, a.telefon, a.adresse ));
    }
  });
  return data;
}

function speicherePatienten(liste) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(liste));
}

// Firestore laden
async function ladePatientVonFirestore(id) {
  try {
    const doc = await db.collection('users').doc(userId).collection('patients').doc(id).get(); 
    if (!doc.exists) {
      console.warn(`⚠️ Patient mit ID ${id} nicht gefunden.`);
      return;
    }
    const data = doc.data();
    if (Array.isArray(data.arzt)) {
      data.arzt = data.arzt.map(a => new Arzt(a.name, a.fach, a.email, a.telefon, a.adresse));
    }
    const patients = ladePatienten();
    const idx = patients.findIndex(p => p.id === id);
    if (idx >= 0) patients[idx] = data;
    else patients.push(data);
    speicherePatienten(patients);
    console.log("✅ Ärzte aus Firestore geladen.");
  } catch (err) {
    console.error("❌ Fehler beim Laden aus Firestore:", err.message);
  }
}

async function speicherePatientNachFirestore(id, patient) {
  try {
    const dataToSave = {
      ...patient,
      arzt: patient.arzt.map(a => ({
        name: a.name,
        fach: a.fach,
        email: a.email,
        telefon: a.telefon,
        adresse: a.adresse
      }))
    };
    await db.collection('users').doc(userId).collection('patients').doc(id).set(dataToSave);
    console.log("✅ Ärzte in Firestore gespeichert.");
  } catch (err) {
    console.error("❌ Fehler beim Speichern in Firestore:", err.message);
  }
}

// DOM-Elemente
const tabelle = document.querySelector("#arztTabelle tbody");

// DOM ready
document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  if (!id) {
    console.error("❌ Kein Patient-ID in der URL gefunden.");
    return;
  }

  await ladePatientVonFirestore(id);

  const patientListe = ladePatienten();
  const patient = patientListe.find(p => p.id === id);
  if (!patient) {
    console.error('❌ Patient nicht gefunden:', id);
    return;
  }

 
   // Patientennamen im Header anzeigen
  const nameElem = document.getElementById('patient-name');
  const { vorname = '', nachname = '' } = patient.personalData || {};
  nameElem.textContent = `Patient: ${vorname} ${nachname}`.trim();

  const tbody = document.querySelector("#arztTabelle tbody");
  // Daten abrufen und anzeigen
  function ladeDaten() {
      const arzt = patient.arzt || [];
      
      tbody.innerHTML = "";

      arzt.forEach((daten, index) => {

        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${index}</td>
          <td>${daten.name}</td>
          <td>${daten.fach}</td>
          <td>${daten.email}</td>
          <td>${daten.telefon}</td>
          <td>${daten.adresse}</td>
        `;

        row.addEventListener("click", (event) => {
        aktuelleArztId = index;
        tbody.querySelectorAll("tr").forEach(r => r.classList.remove("selected"));
        row.classList.add("selected");

        const menu = document.getElementById('context-menu');
        menu.style.display = 'block';
        menu.style.left = `${event.pageX + 5}px`;
        menu.style.top = `${event.pageY + 5}px`;

        // Kontextmenü: Edit-Button
        document.getElementById('edit-button').onclick = () => {
          const modal = document.getElementById('edit-modal-overlay');
          const nameInput    = document.getElementById('modal-arzt-name');
          const fachInput    = document.getElementById('modal-arzt-fach');
          const emailInput   = document.getElementById('modal-arzt-email');
          const telInput     = document.getElementById('modal-arzt-telefon');
          const adresseInput = document.getElementById('modal-arzt-adresse');
          const fertigBtn    = document.getElementById('modal-save');
          const cancelBtn    = document.getElementById('modal-cancel');

          nameInput.value    = daten.name    || "";
          fachInput.value    = daten.fach    || "";
          emailInput.value   = daten.email   || "";
          telInput.value     = daten.telefon || "";
          adresseInput.value = daten.adresse || "";

          modal.style.display = 'flex';
          menu.style.display  = 'none';

          fertigBtn.onclick = async () => {
            const updates = {
              name:    nameInput.value.trim(),
              fach:    fachInput.value.trim(),
              email:   emailInput.value.trim(),
              telefon: telInput.value.trim(),
              adresse: adresseInput.value.trim()
            };

            if (updates.name.length < 2 || updates.fach.length < 2) {
              alert("Bitte mindestens Name und Fach korrekt ausfüllen.");
              return;
            }
            
            speicherePatienten(patientListe)
            await speicherePatientNachFirestore(id, patient);
            ladeDaten();
            modal.style.display = 'none';
          };

          cancelBtn.onclick = () => {
            modal.style.display = 'none';
          };
        };

        // Kontextmenü: Delete-Button
        document.getElementById('delete-button').onclick = async () => {
        const confirmBox = document.getElementById("confirm-delete-modal");
        confirmBox.style.display = "flex";

        document.getElementById('confirm-delete-yes').onclick = async () => {
          arzt.splice(aktuelleArztId, 1); // remove from array
          speicherePatienten(patientListe);
          await speicherePatientNachFirestore(id, patient);
          ladeDaten();
          confirmBox.style.display = "none";
          document.getElementById('context-menu').style.display = 'none';
        };

        document.getElementById('confirm-delete-no').onclick = () => {
          confirmBox.style.display = "none";
        };
      };

      });


        tbody.appendChild(row);

      });

    
  }
  ladeDaten();



  // Arzt hinzufügen
  document.getElementById("add-med").addEventListener("click", async () => {
  const name = document.getElementById("arztname").value.trim();
  const fach = document.getElementById("fach").value.trim();
  const email = document.getElementById("eMail").value.trim();
  const telefon = document.getElementById("Telefonnummer").value.trim();
  const adresse = document.getElementById("Adresse").value.trim();

  if (!name || !fach) {
    alert("Name und Fach müssen ausgefüllt sein!");
    return;
  }

  const neuerArzt = new Arzt(name, fach, email, telefon, adresse);
  if (!Array.isArray(patient.arzt)) {
    patient.arzt = [];
  }
  patient.arzt.push(neuerArzt);
  // zum lokalen Patienten hinzufügen
  speicherePatienten(patientListe); // im localStorage speichern
  await speicherePatientNachFirestore(id, patient); // in Firestore speichern
  ladeDaten(); // Tabelle neu laden

  // Eingabefelder leeren
  document.getElementById("arztname").value = "";
  document.getElementById("fach").value = "";
  document.getElementById("eMail").value = "";
  document.getElementById("Telefonnummer").value = "";
  document.getElementById("Adresse").value = "";
  });



});

document.addEventListener('click', (e) => {
  const menu = document.getElementById('context-menu');
  if (!menu.contains(e.target) && !e.target.closest('tr')) {
    menu.style.display = 'none';
  }
});

/* Nach dem Laden Daten holen
document.addEventListener("DOMContentLoaded", ladeDaten);*/
