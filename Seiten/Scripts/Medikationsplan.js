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

  const idxSelect = document.getElementById('indexDropdown');
  const newNameIn = document.getElementById('neuesMedikament');
  const newAnzahlIn = document.getElementById('neueAnzahl');
  const neueEinheitIn = document.getElementById('neueEinheit');
  const newZeitIn = document.getElementById('neueTageszeit');
  const newWochIn = document.getElementById('neueWochentage');
  const editBtn = document.getElementById('edit-med');

  const delSelect = document.getElementById('indexLoeschenDropdown');
  const deleteBtn = document.getElementById('delete-med');
  const clearBtn = document.getElementById('clear-med');

  const tableBody = document.querySelector('#medikationsTabelle tbody');

  function showError(elem, msg) {
    elem.style.borderColor = 'red';
    elem.title = msg;
  }

  function clearErrors() {
    [nameIn, anzahlIn, einheitIn, tageszeitIn, wochentageIn,
      newNameIn, newAnzahlIn, neueEinheitIn, newZeitIn, newWochIn,
      idxSelect, delSelect
    ].forEach(el => {
      if (el) {
        el.style.borderColor = '';
        el.title = '';
      }
    });
  }

  function validateName(val) {
    return val.trim().length > 1;
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
  idxSelect.innerHTML = '';
  delSelect.innerHTML = '';

  plan.forEach((m, i) => {
    // 1) Build row
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${i}</td>
      <td>${m.medikament}</td>
      <td>${m.anzahl}</td>
      <td>${m.tageszeit}</td>
      <td>${m.wochentage}</td>
    `;

    // 2) Click handler: select & prefill
    tr.addEventListener('click', () => {
      // a) Highlight only this row
      tableBody.querySelectorAll('tr').forEach(r => r.classList.remove('selected'));
      tr.classList.add('selected');

      // b) Fill “edit” dropdown & inputs
      idxSelect.value = i;
      newNameIn.value   = m.medikament;
      newAnzahlIn.value = m.anzahl.replace(/\s*\w+$/, '');    // strip unit
      neueEinheitIn.value = m.anzahl.split(' ').slice(1).join(' ');
      newZeitIn.value   = m.tageszeit;
      newWochIn.value   = m.wochentage;

      // c) Fill delete dropdown
      delSelect.value = i;
    });

    tableBody.appendChild(tr);

    // 3) Also rebuild the two select-lists
    const opt = new Option(`${i}: ${m.medikament}`, i);
    idxSelect.add(opt.cloneNode(true));
    delSelect.add(opt.cloneNode(true));
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

  editBtn.addEventListener('click', async () => {
    const i = parseInt(idxSelect.value, 10);
    if (isNaN(i) || i < 0 || i >= plan.length) {
      showError(idxSelect, 'Ungültiger Index');
      return;
    }

    clearErrors();
    let ok = true;
    if (newNameIn.value && !validateName(newNameIn.value)) {
      showError(newNameIn, 'Medikamentname mind. 2 Zeichen');
      ok = false;
    }
    if (newAnzahlIn.value && !validateAnzahl(newAnzahlIn.value)) {
      showError(newAnzahlIn, 'Ungültige Dosierung');
      ok = false;
    }
    if (newWochIn.value && !validateWochentage(newWochIn.value)) {
      showError(newWochIn, 'Wochentage: Mo,Di,... So');
      ok = false;
    }
    if (!ok) return;

    const updateData = {};
    if (newNameIn.value.trim()) {
      updateData.medikament = newNameIn.value.trim();
    }
    if (newAnzahlIn.value.trim()) {
      updateData.anzahl = `${newAnzahlIn.value.trim()} ${neueEinheitIn.value}`;
    }
    if (newZeitIn.value.trim()) {
      updateData.tageszeit = newZeitIn.value.trim();
    }
    if (newWochIn.value.trim()) {
      updateData.wochentage = newWochIn.value.trim();
    }

    plan[i].aktualisieren(updateData);
    speicherePatienten(patientListe);
    console.log("✅ Medikament lokal bearbeitet.");
    await speicherePatientNachFirestore(id, patient);
    render();

    newNameIn.value = '';
    newAnzahlIn.value = '';
    neueEinheitIn.selectedIndex = 0;
    newZeitIn.value = '';
    newWochIn.value = '';
    idxSelect.selectedIndex = 0;
  });

  deleteBtn.addEventListener('click', async () => {
    const i = parseInt(delSelect.value, 10);
    if (isNaN(i) || i < 0 || i >= plan.length) {
      showError(delSelect, 'Ungültiger Index');
      return;
    }
    const entfernt = plan.splice(i, 1);
    speicherePatienten(patientListe);
    console.log(`✅ Medikament gelöscht: ${entfernt[0].medikament}`);
    await speicherePatientNachFirestore(id, patient);
    render();

    delSelect.selectedIndex = 0;
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
