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
      
      const completeBtn = document.getElementById('complete-button');
      if (history[i].status === 'completed') {
        completeBtn.textContent = '❌ Als aktiv markieren';
      } else {
        completeBtn.textContent = '✅ Geheilt markieren';
      }

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
          clearErrors();
          let valid = true;

          const neuerName = nameInput.value.trim();
          const neuesDatum = datumInput.value;

          if (!validateName(neuerName)) {
            showError(nameInput, 'Bitte gib einen gültigen Namen (mind. 2 Zeichen) ein.');
            valid = false;
          }
          if (!valid) return;

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
      history[i].status = (history[i].status === 'completed') ? 'active' : 'completed';
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


  function clearErrors() {
  // Remove all error messages
  document.querySelectorAll('.error-message').forEach(e => e.remove());

  // Reset border colors for all inputs and textareas
  document.querySelectorAll('input, textarea').forEach(el => {
    el.style.borderColor = '';
    el.title = '';
    });
  }


  function showError(elem, msg) {
    elem.style.borderColor = 'red';
    elem.title = msg;

    // Check if error message already exists
    if (!elem.nextElementSibling || !elem.nextElementSibling.classList.contains('error-message')) {
        const errorMsg = document.createElement('div');
        errorMsg.className = 'error-message';
        errorMsg.style.color = 'red';
        errorMsg.style.fontSize = '0.9em';
        errorMsg.style.marginTop = '5px';
        errorMsg.textContent = msg;
        elem.insertAdjacentElement('afterend', errorMsg);
    }
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




