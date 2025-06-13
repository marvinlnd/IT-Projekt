// Firebase initialisieren
const firebaseConfig = {
  apiKey: "AIzaSyAakpWbT87pJ4Bv1Xr0Mk2lCNhNols7KR4",
  authDomain: "it-projekt-ffc4d.firebaseapp.com",
  projectId: "it-projekt-ffc4d",
  storageBucket: "it-projekt-ffc4d.appspot.com", // ❗ KORRIGIERT
  messagingSenderId: "534546734981",
  appId: "1:534546734981:web:13bffd7c78893bd0e3aeec"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
console.log("✅ Firebase initialisiert!");

const userId = localStorage.getItem("user-id");

// Klasse für einen History-Eintrag
class Krankheit {
  constructor(name, datum, status = 'active') {
    this.nameDerKrankheit = name;
    this.datumDerFeststellung = datum;
    this.status = status;
  }

  aktualisieren(data) {
    if (data.nameDerKrankheit !== undefined) this.nameDerKrankheit = data.nameDerKrankheit;
    if (data.datumDerFeststellung !== undefined) this.datumDerFeststellung = data.datumDerFeststellung;
    if (data.status !== undefined) this.status = data.status;
  }
}


// LocalStorage-Helfer
const STORAGE_KEY = 'patientListe';

function ladePatienten() {
  const data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  data.forEach(p => {
    if (Array.isArray(p.history)) {
      p.history = p.history.map(h => new Krankheit(h.nameDerKrankheit, h.datumDerFeststellung,h.status || 'active'));
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
    if (Array.isArray(data.history)) {
      data.history = data.history.map(h => new Krankheit(h.nameDerKrankheit, h.datumDerFeststellung, h.status || 'active'));
    }
    const patients = ladePatienten();
    const idx = patients.findIndex(p => p.id === id);
    if (idx >= 0) patients[idx] = data;
    else patients.push(data);
    speicherePatienten(patients);
    console.log("✅ Krankenhistorie aus Firestore geladen.");
  } catch (err) {
    console.error("❌ Fehler beim Laden aus Firestore:", err.message);
  }
}

// Firestore speichern
async function speicherePatientNachFirestore(id, patient) {
  try {
    const dataToSave = {
      ...patient,
      history: patient.history.map(h => ({
        nameDerKrankheit: h.nameDerKrankheit,
        datumDerFeststellung: h.datumDerFeststellung,
        status: h.status || 'active'  // default fallback
      }))
    };
    await db.collection('users').doc(userId).collection('patients').doc(id).set(dataToSave); 
    console.log("✅ Krankenhistorie in Firestore gespeichert.");
  } catch (err) {
    console.error("❌ Fehler beim Speichern in Firestore:", err.message);
  }
}

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

  const history = patient.history || [];

  // Patientennamen im Header anzeigen
  const nameElem = document.getElementById('patient-name');
  const { vorname = '', nachname = '' } = patient.personalData || {};
  nameElem.textContent = `Patient: ${vorname} ${nachname}`.trim();

  // DOM-Elemente
  const tblBody    = document.querySelector('#krankenhistorieTabelle tbody');
  const nameIn     = document.getElementById('nameDerKrankheit');
  const datumIn    = document.getElementById('datumDerFeststellung');
  const addBtn     = document.getElementById('add-history');

  
 

function renderTable() {
  // Clear out old rows
  tblBody.innerHTML = '';

  history.forEach((eintrag, i) => {
    // Create the row
    const row = document.createElement('tr');
    const statusClass = eintrag.status === 'completed' ? 'status-completed' : 'status-active';
    const statusLabel = eintrag.status === 'completed' ? 'Geheilt' : 'Aktiv';

    row.innerHTML = `
      <td>${i}</td>
      <td>${eintrag.nameDerKrankheit}</td>
      <td>${eintrag.datumDerFeststellung}</td>
      <td><span class="status-badge ${statusClass}">${statusLabel}</span></td>
    `;

    // 1) Klick-Handler fürs Auswählen
    row.addEventListener("click", (event) => {
      // Zeile markieren
      tblBody.querySelectorAll("tr").forEach(r => r.classList.remove("selected"));
      row.classList.add("selected");

      // Pop-up-Menü vorbereiten
      const menu = document.getElementById('context-menu');
      menu.style.display = 'block';
      menu.style.left = `${event.pageX + 5}px`;
      menu.style.top = `${event.pageY + 5}px`;

      // ID für Edit/Delete merken
      

      // Event-Handler setzen
      document.getElementById('edit-button').onclick = () => {
        const modal = document.getElementById('edit-modal-overlay');
        const nameInput = document.getElementById('modal-name');
        const datumInput = document.getElementById('modal-datum');

        // Werte ausfüllen
        nameInput.value = history[i].nameDerKrankheit;
        datumInput.value = history[i].datumDerFeststellung;

        // Modal anzeigen
        modal.style.display = 'flex';

        // Modal-Funktionen
        const fertigBtn = document.getElementById('modal-save');
        const cancelBtn = document.getElementById('modal-cancel');

        // Fertig gedrückt
        fertigBtn.onclick = async () => {
          const neuerName = nameInput.value.trim();
          const neuesDatum = datumInput.value;


          if (neuerName.length < 2) {
            alert("Name zu kurz.");
            return;
          }

          history[i].nameDerKrankheit = neuerName;
          history[i].datumDerFeststellung = neuesDatum;

          speicherePatienten(patientListe);
          await speicherePatientNachFirestore(id, patient);
          renderTable();

          modal.style.display = 'none';
        };

        // Abbrechen gedrückt
        cancelBtn.onclick = () => {
          modal.style.display = 'none';
        };

        // Kontextmenü schließen
        document.getElementById('context-menu').style.display = 'none';
      };


      document.getElementById('delete-button').onclick = async () => {
      if (confirm("Möchtest du diesen Eintrag wirklich löschen?")) {
        history.splice(i, 1);
        speicherePatienten(patientListe);
        await speicherePatientNachFirestore(id, patient);
        renderTable();
      }
      document.getElementById('context-menu').style.display = 'none';
      };


      document.getElementById('complete-button').onclick = async () => {
      history[i].status = 'completed';
      speicherePatienten(patientListe);
      await speicherePatientNachFirestore(id, patient);
      renderTable();

      document.getElementById('context-menu').style.display = 'none';
     };
    });



    // 2) Hänge die mit Handler versehenen row ans tbody
    tblBody.appendChild(row);
  });
  }
   // Start
  renderTable();


  function clearErrors(section) {
    section.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
    section.querySelectorAll('.error-message').forEach(el => el.remove());
  }

  function showError(inputElem, message) {
    inputElem.classList.add('error');
    const msg = document.createElement('div');
    msg.className = 'error-message';
    msg.textContent = message;
    inputElem.insertAdjacentElement('afterend', msg);
  }

  function validateName(name) {
    return name.length >= 2;
  }


  // Hinzufügen
  addBtn.addEventListener('click', async () => {
    clearErrors(document.querySelector('.form-section'));
    const name = nameIn.value.trim();
    const datum = datumIn.value.trim();
    let valid = true;

    if (!validateName(name)) {
      showError(nameIn, 'Bitte gib einen gültigen Namen (mind. 2 Zeichen) ein.');
      valid = false;
    }



    if (!valid) return;

    history.push(new Krankheit(name, datum));
    speicherePatienten(patientListe);
    await speicherePatientNachFirestore(id, patient);
    renderTable();
    nameIn.value = '';
    datumIn.value = '';
  });

 
});

document.addEventListener('click', (e) => {
  const menu = document.getElementById('context-menu');
  if (!menu.contains(e.target) && !e.target.closest('tr')) {
    menu.style.display = 'none';
  }
});




