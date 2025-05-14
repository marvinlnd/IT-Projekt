// javascript/krankenhistorie.js

// Klasse für einen History-Eintrag
class Krankheit {
  constructor(name, datum) {
    this.nameDerKrankheit = name;
    this.datumDerFeststellung = datum;
  }
}

// LocalStorage-Helfer
const STORAGE_KEY = 'patientListe';
function ladePatienten() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}
function speicherePatienten(liste) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(liste));
}

document.addEventListener('DOMContentLoaded', () => {
  // Patientendaten aus URL & Storage laden
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  const patientListe = ladePatienten();
  const patient = patientListe.find(p => p.id === id);
  if (!patient) {
    console.error('Patient nicht gefunden:', id);
    return;
  }
  const history = patient.history;

  // Patientennamen im Header anzeigen
  const nameElem = document.getElementById('patient-name');
  const { vorname = '', nachname = '' } = patient.personalData;
  nameElem.textContent = `Patient: ${vorname} ${nachname}`.trim();

  // DOM-Referenzen
  const tblBody    = document.querySelector('#krankenhistorieTabelle tbody');
  const nameIn     = document.getElementById('nameDerKrankheit');
  const datumIn    = document.getElementById('datumDerFeststellung');
  const addBtn     = document.getElementById('add-history');

  const idxIn      = document.getElementById('index');
  const newNameIn  = document.getElementById('neuerNameDerKrankheit');
  const newDatumIn = document.getElementById('neuesDatumDerFeststellung');
  const editBtn    = document.getElementById('edit-history');

  const delIdxIn   = document.getElementById('indexLoeschen');
  const delBtn     = document.getElementById('delete-history');

  const clearBtn   = document.getElementById('clear-history');

  // Tabelle rendern
  function renderTable() {
    tblBody.innerHTML = '';
    history.forEach((eintrag, i) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${i}</td>
        <td>${eintrag.nameDerKrankheit}</td>
        <td>${eintrag.datumDerFeststellung}</td>
      `;
      tblBody.appendChild(tr);
    });
  }

  // Fehler-Handling
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

  // Validierungen
  function validateName(name) {
    return name.length >= 2;
  }
  function validateDate(dateStr) {
    const parts = dateStr.split('.');
    if (parts.length !== 3) return false;
    const [d, m, y] = parts.map(p => parseInt(p, 10));
    const dt = new Date(y, m - 1, d);
    if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) return false;
    return dt <= new Date();
  }

  // Auto-Prefill beim Index-Eingeben
  idxIn.addEventListener('input', () => {
    clearErrors(document.querySelector('.form-section'));
    const i = parseInt(idxIn.value, 10);
    if (!isNaN(i) && i >= 0 && i < history.length) {
      newNameIn.value  = history[i].nameDerKrankheit;
      newDatumIn.value = history[i].datumDerFeststellung;
    } else {
      newNameIn.value = '';
      newDatumIn.value = '';
    }
  });

  // Hinzufügen
  addBtn.addEventListener('click', () => {
    clearErrors(document.querySelector('.form-section'));
    const name  = nameIn.value.trim();
    const datum = datumIn.value.trim();
    let valid = true;
    if (!validateName(name)) {
      showError(nameIn, 'Bitte gib einen gültigen Namen (mind. 2 Zeichen) ein.');
      valid = false;
    }
    if (!validateDate(datum)) {
      showError(datumIn, 'Bitte gib ein gültiges Datum im Format DD.MM.YYYY ein (kein zukünftiges Datum).');
      valid = false;
    }
    if (!valid) return;
    history.push(new Krankheit(name, datum));
    speicherePatienten(patientListe);
    renderTable();
    nameIn.value = '';
    datumIn.value = '';
  });

  // Bearbeiten
  editBtn.addEventListener('click', () => {
    clearErrors(document.querySelector('.form-section'));
    const i = parseInt(idxIn.value, 10);
    if (isNaN(i) || i < 0 || i >= history.length) {
      showError(idxIn, 'Ungültiger Index.');
      return;
    }
    const name  = newNameIn.value.trim();
    const datum = newDatumIn.value.trim();
    let valid = true;
    if (name && !validateName(name)) {
      showError(newNameIn, 'Neuer Name muss mind. 2 Zeichen lang sein.');
      valid = false;
    }
    if (datum && !validateDate(datum)) {
      showError(newDatumIn, 'Datum muss im Format DD.MM.YYYY sein und darf nicht in der Zukunft liegen.');
      valid = false;
    }
    if (!valid) return;
    if (name)  history[i].nameDerKrankheit      = name;
    if (datum) history[i].datumDerFeststellung = datum;
    speicherePatienten(patientListe);
    renderTable();
    idxIn.value = newNameIn.value = newDatumIn.value = '';
  });

  // Löschen
  delBtn.addEventListener('click', () => {
    clearErrors(document.querySelector('.form-section'));
    const i = parseInt(delIdxIn.value, 10);
    if (isNaN(i) || i < 0 || i >= history.length) {
      showError(delIdxIn, 'Ungültiger Index.');
      return;
    }
    history.splice(i, 1);
    speicherePatienten(patientListe);
    renderTable();
    delIdxIn.value = '';
  });

 // Alles löschen (ohne Reload)
clearBtn.addEventListener('click', (e) => {
  e.preventDefault();
  if (confirm('Möchtest du wirklich alle Einträge löschen?')) {
    // Array komplett leeren
    history.length = 0;
    // Veränderungen in den Patientendaten speichern
    patient.history = history;
    speicherePatienten(patientListe);
    // Tabelle neu zeichnen (wird jetzt leer sein)
    renderTable();
  }
});



  // Initialer Aufruf
  renderTable();
});
