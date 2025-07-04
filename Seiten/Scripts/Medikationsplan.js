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
  storageBucket: "it-projekt-ffc4d.firebasestorage.app",
  messagingSenderId: "534546734981",
  appId: "1:534546734981:web:13bffd7c78893bd0e3aeec"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
console.log("✅ Firebase initialisiert!");

const userId = localStorage.getItem("user-id");


class Medikation {
  constructor(medikament, anzahl, tageszeit, wochentage) {
    this.medikament = medikament;
    this.anzahl = anzahl;
    this.tageszeit = tageszeit;
    this.wochentage = wochentage;
  }

  aktualisieren(data) {
    if (data.medikament !== undefined) this.medikament = data.medikament;
    if (data.anzahl !== undefined) this.anzahl = data.anzahl;
    if (data.tageszeit !== undefined) this.tageszeit = data.tageszeit;
    if (data.wochentage !== undefined) this.wochentage = data.wochentage;
  }
}

const STORAGE_KEY = 'patientListe';

function ladePatienten() {
  const data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  data.forEach(p => {
    if (Array.isArray(p.medicationPlan)) {
      p.medicationPlan = p.medicationPlan.map(m => new Medikation(m.medikament, m.anzahl, m.tageszeit, m.wochentage));
    }
  });
  return data;
}

function speicherePatienten(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

async function ladePatientVonFirestore(id) {
  try {
    const doc = await db.collection('users').doc(userId).collection('patients').doc(id).get(); if (!doc.exists) {
      console.warn(`⚠️ Patient mit ID ${id} nicht gefunden.`);
      return;
    }

    const data = doc.data();
    if (Array.isArray(data.medicationPlan)) {
      data.medicationPlan = data.medicationPlan.map(m => new Medikation(m.medikament, m.anzahl, m.tageszeit, m.wochentage));
    }

    const patients = ladePatienten();
    const idx = patients.findIndex(p => p.id === id);
    if (idx >= 0) patients[idx] = data;
    else patients.push(data);

    speicherePatienten(patients);
    console.log("✅ Medikationsplan aus Firestore geladen.");
  } catch (err) {
    console.error("❌ Fehler beim Laden aus Firestore:", err.message);
  }
}

async function speicherePatientNachFirestore(id, patient) {
  try {
    const dataToSave = {
      ...patient,
      medicationPlan: patient.medicationPlan.map(m => ({
        medikament: m.medikament,
        anzahl: m.anzahl,
        tageszeit: m.tageszeit,
        wochentage: m.wochentage
      }))
    };
    await db.collection('users').doc(userId).collection('patients').doc(id).set(dataToSave);
    console.log("✅ Medikationsplan in Firestore gespeichert.");
  } catch (err) {
    console.error("❌ Fehler beim Speichern in Firestore:", err.message);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  let selectedIndex = null;
  
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  await ladePatientVonFirestore(id);

  let patientListe = ladePatienten();
  let patient = patientListe.find(p => p.id === id);
  if (!patient) return;

  const plan = patient.medicationPlan;

  const nameElem = document.getElementById('patient-name');
  const { vorname = '', nachname = '' } = patient.personalData || {};
  nameElem.textContent = `Patient: ${vorname} ${nachname}`.trim();

  // Formularelemente
  const nameIn = document.getElementById('medikament');
  const anzahlIn = document.getElementById('anzahl');
  const einheitIn = document.getElementById('einheit');
  const tageszeitIn = document.getElementById('tageszeit');
  const wochentageIn = document.getElementById('wochentage');
  const addBtn = document.getElementById('add-med');

  
  const newNameIn = document.getElementById('neuesMedikament');
  const newAnzahlIn = document.getElementById('neueAnzahl');
  const neueEinheitIn = document.getElementById('neueEinheit');
  const newZeitIn = document.getElementById('neueTageszeit');
  const newWochIn = document.getElementById('neueWochentage');
  const editBtn = document.getElementById('edit-med');

  
  const deleteBtn = document.getElementById('delete-med');
  const clearBtn = document.getElementById('clear-med');

  const tableBody = document.querySelector('#medikationsTabelle tbody');

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


  function clearErrors() {
    [nameIn, anzahlIn, einheitIn, tageszeitIn, wochentageIn,
      newNameIn, newAnzahlIn, neueEinheitIn, newZeitIn, newWochIn
    ].forEach(el => {
      if (el) {
        el.style.borderColor = '';
        el.title = '';
        const next = el.nextElementSibling;
        if(next && next.classList.contains('error-message')) {
          next.remove();
        }
      }
    });
  }


  function validateName(val) {
    return val.trim().length > 1 ;
  }

  function validateAnzahl(val) {
    return /^\d+([.,]\d+)?$/.test(val.trim());
  }

  function validateWochentage(val) {
    return /^(Mo|Di|Mi|Do|Fr|Sa|So)(,\s*(Mo|Di|Mi|Do|Fr|Sa|So))*$/.test(val.trim());
  }

  function validate() {
    clearErrors();
    let ok = true;

    if (!validateName(nameIn.value)) {
      showError(nameIn, 'Medikamentname mind. 2 Zeichen');
      ok = false;
    }
    if (!validateAnzahl(anzahlIn.value)) {
      showError(anzahlIn, 'Ungültige Dosierung');
      ok = false;
    }
    if (!validateWochentage(wochentageIn.value)) {
      showError(wochentageIn, 'Wochentage: Mo,Di,... So');
      ok = false;
    }

    return ok;
  }

  function render() {
    tableBody.innerHTML = '';
    

    plan.forEach((m, i) => {
      const tr = document.createElement('tr');
      const [num, ...unitArr] = m.anzahl.split(' ');
      const dose = unitArr.join(' ');
      tr.innerHTML = `
        <td>${i}</td>
        <td>${m.medikament}</td>
        <td>${num}</td>
        <td>${dose}</td>
        <td>${m.tageszeit}</td>
        <td>${m.wochentage}</td>
      `;

      tr.addEventListener('click', event => {
        // Highlight
        
        tableBody.querySelectorAll('tr').forEach(r => r.classList.remove('selected'));
        tr.classList.add('selected');

        // Show context-menu
        const menu = document.getElementById('context-menu');
        menu.style.display = 'block';
        menu.style.left = `${event.pageX + 5}px`;
        menu.style.top  = `${event.pageY + 5}px`;

        // Store index in the dropdowns
        selectedIndex = i;

        // EDIT button → open modal
        document.getElementById('edit-button').onclick = () => {
          const m = plan[selectedIndex]; 
          const modal     = document.getElementById('edit-modal-overlay');
          const nameInM   = document.getElementById('modal-medikament');
          const anzInM    = document.getElementById('modal-anzahl');
          const unitInM   = document.getElementById('einheit');
          const timeInM   = document.getElementById('modal-tageszeit');
          const daysInM   = document.getElementById('modal-wochentage');
          const saveBtn   = document.getElementById('modal-save');
          const cancelBtn = document.getElementById('modal-cancel');
           

          // Prefill
          nameInM.value  = m.medikament;
          const [num, ...unit] = m.anzahl.split(' ');
          anzInM.value   = num;
          unitInM.value  = unit.join(' ');
          timeInM.value  = m.tageszeit;
          daysInM.value  = m.wochentage;

          modal.style.display = 'flex';
          menu.style.display  = 'none';

          saveBtn.onclick = async () => {
            clearErrors();
            let ok = true;

            if (nameInM.value.trim() && !validateName(nameInM.value.trim())) {
              showError(nameInM, 'Medikamentname mind. 2 Zeichen');
              ok = false;
            }
            if (anzInM.value.trim() && !validateAnzahl(anzInM.value.trim())) {
              showError(anzInM, 'Ungültige Dosierung');
              ok = false;
            }
            if (daysInM.value.trim() && !validateWochentage(daysInM.value.trim())) {
              showError(daysInM, 'Wochentage: Mo,Di,... So');
              ok = false;
            }
            if (!ok) return;

            // Collect updates
            const updates = {
              medikament: nameInM.value.trim(),
              anzahl:     `${anzInM.value.trim()} ${unitInM.value}`,
              tageszeit:  timeInM.value,
              wochentage: daysInM.value.trim()
            };

            // Apply locally
            plan[selectedIndex].aktualisieren(updates);
            speicherePatienten(patientListe);
            await speicherePatientNachFirestore(id, patient);

            render();
            modal.style.display = 'none';
          };

          cancelBtn.onclick = () => {
            modal.style.display = 'none';
          };
        };

        // DELETE button → remove entry
        // DELETE button → Confirm first
        document.getElementById('delete-button').onclick = () => {
          if (selectedIndex === null || selectedIndex < 0 || selectedIndex >= plan.length) return;

          // Modal anzeigen
          const confirmModal = document.getElementById('confirm-delete-modal');
          confirmModal.style.display = 'flex';

          // Ja-Button: löschen
          const yesBtn = document.getElementById('confirm-delete-yes');
          const noBtn  = document.getElementById('confirm-delete-no');

          const handleDelete = async () => {
            const removed = plan.splice(selectedIndex, 1);
            await speicherePatientNachFirestore(patient.id, patient);
            speicherePatienten(patientListe);
            render();
            console.log(`✅ Medikament gelöscht: ${removed[0].medikament}`);
            document.getElementById('context-menu').style.display = 'none';
            confirmModal.style.display = 'none';
            selectedIndex = null;

            // Eventlistener entfernen nach Aktion
            yesBtn.removeEventListener('click', handleDelete);
            noBtn.removeEventListener('click', cancelDelete);
          };

          const cancelDelete = () => {
            confirmModal.style.display = 'none';
            yesBtn.removeEventListener('click', handleDelete);
            noBtn.removeEventListener('click', cancelDelete);
          };

          yesBtn.addEventListener('click', handleDelete);
          noBtn.addEventListener('click', cancelDelete);
        };

       



      });

      tableBody.appendChild(tr);

      
    });
  }



  addBtn.addEventListener('click', async () => {
    if (!validate()) {
      console.warn("⚠️ Ungültige Eingaben beim Hinzufügen.");
      return;
    }

    const dosierung = `${anzahlIn.value.trim()} ${einheitIn.value}`;
    plan.push(new Medikation(nameIn.value.trim(), dosierung, tageszeitIn.value.trim(), wochentageIn.value.trim()));
    speicherePatienten(patientListe);
    console.log("✅ Medikament lokal hinzugefügt.");
    await speicherePatientNachFirestore(id, patient);
    render();

    // Formular zurücksetzen
    nameIn.value = '';
    anzahlIn.value = '';
    einheitIn.selectedIndex = 0;
    tageszeitIn.value = '';
    wochentageIn.value = '';
  });


  clearBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    if (!confirm("Wirklich alle Medikamente löschen?")) return;
    plan.length = 0;
    speicherePatienten(patientListe);
    console.log("✅ Alle Medikamente lokal gelöscht.");
    await speicherePatientNachFirestore(id, patient);
    render();
  });

  render();
});
document.addEventListener('click', (e) => {
  const menu = document.getElementById('context-menu');
  if (!menu.contains(e.target) && !e.target.closest('tr')) {
    menu.style.display = 'none';
  }
});
