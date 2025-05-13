// javascript/Medikationsplan.js

class Medikation {
  constructor(medikament, anzahl, tageszeit, wochentage) {
    this.medikament = medikament;
    this.anzahl = anzahl;
    this.tageszeit = tageszeit;
    this.wochentage = wochentage;
  }
  aktualisieren(data) {
    if (data.medikament  !== undefined) this.medikament  = data.medikament;
    if (data.anzahl      !== undefined) this.anzahl      = data.anzahl;
    if (data.tageszeit   !== undefined) this.tageszeit   = data.tageszeit;
    if (data.wochentage  !== undefined) this.wochentage  = data.wochentage;
  }
}

const STORAGE_KEY = 'patientListe';
function ladePatienten() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}
function speicherePatienten(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  const patientListe = ladePatienten();
  const patient = patientListe.find(p => p.id === id);
  if (!patient) return;
  
  // Patientenname anzeigen
  const nameElem = document.getElementById('patient-name');
  const { vorname = '', nachname = '' } = patient.personalData;
  nameElem.textContent = `Patient: ${vorname} ${nachname}`.trim();

  const plan = patient.medicationPlan;
  
  // DOM-Referenzen
  const formSection   = document.querySelector('.form-section');
  const nameIn       = document.getElementById('medikament');
  const anzahlIn     = document.getElementById('anzahl');
  const tageszeitIn  = document.getElementById('tageszeit');
  const wochentageIn = document.getElementById('wochentage');
  const addBtn       = document.getElementById('add-med');

  const idxSelect    = document.getElementById('indexDropdown');
  const newNameIn    = document.getElementById('neuesMedikament');
  const newAnzahlIn  = document.getElementById('neueAnzahl');
  const newZeitIn    = document.getElementById('neueTageszeit');
  const newWochIn    = document.getElementById('neueWochentage');
  const editBtn      = document.getElementById('edit-med');

  const delSelect    = document.getElementById('indexLoeschenDropdown');
  const deleteBtn    = document.getElementById('delete-med');
  const clearBtn     = document.getElementById('clear-med');

  const tableBody    = document.querySelector('#medikationsTabelle tbody');

  // Fehler-Handling
  function clearErrors() {
    formSection.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
    formSection.querySelectorAll('.error-message').forEach(el => el.remove());
  }
  function showError(elem, msg) {
    elem.classList.add('error');
    const div = document.createElement('div');
    div.className = 'error-message';
    div.textContent = msg;
    elem.insertAdjacentElement('afterend', div);
  }

  // Validierungen
  function validateName(val) {
    return val.trim().length >= 2;
  }
  function validateAnzahl(val) {
    return /^\d+(?:[\.,]\d+)?(?:\s*(mg|ml|tabletten)?)?$/i.test(val.trim());
  }
  function validateTageszeit(val) {
    const allowed = ['morgens','mittags','abends','nachts'];
    return allowed.includes(val.trim().toLowerCase());
  }
  function validateWochentage(val) {
    const allowed = ['Mo','Di','Mi','Do','Fr','Sa','So'];
    const parts = val.split(',').map(p => p.trim());
    return parts.length > 0 && parts.every(p => allowed.includes(p));
  }

  // Render-Funktion
  function render() {
    tableBody.innerHTML = '';
    plan.forEach((m, i) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${i}</td>
        <td>${m.medikament}</td>
        <td>${m.anzahl}</td>
        <td>${m.tageszeit}</td>
        <td>${m.wochentage}</td>
      `;
      tableBody.appendChild(tr);
    });
    idxSelect.innerHTML = '';
    delSelect.innerHTML = '';
    plan.forEach((m,i) => {
      const o = document.createElement('option'); o.value = i; o.textContent = `${i}: ${m.medikament}`;
      idxSelect.appendChild(o);
      delSelect.appendChild(o.cloneNode(true));
    });
  }

  // Prefill beim Index auswählen
  idxSelect.addEventListener('change', () => {
    clearErrors();
    const i = parseInt(idxSelect.value,10);
    if (!isNaN(i) && i>=0 && i<plan.length) {
      newNameIn.value   = plan[i].medikament;
      newAnzahlIn.value = plan[i].anzahl;
      newZeitIn.value   = plan[i].tageszeit;
      newWochIn.value   = plan[i].wochentage;
    }
  });

  // Hinzufügen
  addBtn.addEventListener('click', () => {
    clearErrors();
    let ok = true;
    if (!validateName(nameIn.value))    { showError(nameIn,'Medikamentname mind. 2 Zeichen'); ok=false; }
    if (!validateAnzahl(anzahlIn.value)){ showError(anzahlIn,'Ungültige Dosierung, z.B. 1,5 mg'); ok=false; }
    if (!validateTageszeit(tageszeitIn.value)){ showError(tageszeitIn,'Nur: morgens, mittags, abends oder nachts'); ok=false; }
    if (!validateWochentage(wochentageIn.value)){ showError(wochentageIn,'Wochentage: Mo,Di,Mi,Do,Fr,Sa,So'); ok=false; }
    if (!ok) return;
    plan.push(new Medikation(nameIn.value.trim(),anzahlIn.value.trim(),tageszeitIn.value.trim(),wochentageIn.value.trim()));
    speicherePatienten(patientListe);
    render();
    nameIn.value=anzahlIn.value=tageszeitIn.value=wochentageIn.value='';
  });

  // Bearbeiten
  editBtn.addEventListener('click', () => {
    clearErrors();
    const i = parseInt(idxSelect.value,10);
    if (isNaN(i)||i<0||i>=plan.length) { showError(idxSelect,'Ungültiger Index'); return; }
    let ok = true;
    if (newNameIn.value && !validateName(newNameIn.value))    { showError(newNameIn,'Medikamentname mind. 2 Zeichen'); ok=false; }
    if (newAnzahlIn.value && !validateAnzahl(newAnzahlIn.value)){ showError(newAnzahlIn,'Ungültige Dosierung'); ok=false; }
    if (newZeitIn.value && !validateTageszeit(newZeitIn.value)){ showError(newZeitIn,'Nur: morgens, mittags, abends oder nachts'); ok=false; }
    if (newWochIn.value && !validateWochentage(newWochIn.value)){ showError(newWochIn,'Wochentage: Mo,Di,Mi,Do,Fr,Sa,So'); ok=false; }
    if (!ok) return;
    plan[i].aktualisieren({medikament:newNameIn.value.trim(),anzahl:newAnzahlIn.value.trim(),tageszeit:newZeitIn.value.trim(),wochentage:newWochIn.value.trim()});
    speicherePatienten(patientListe);
    render();
    newNameIn.value=newAnzahlIn.value=newZeitIn.value=newWochIn.value='';
  });

  // Löschen
  deleteBtn.addEventListener('click', () => {
    const i = parseInt(delSelect.value,10);
    if (isNaN(i)||i<0||i>=plan.length) return;
    plan.splice(i,1);
    speicherePatienten(patientListe);
    render();
  });

  // Alles löschen
  clearBtn.addEventListener('click', (e) => {
  e.preventDefault();
  if (confirm('Wirklich alle Einträge löschen?')) {
    // Das bestehende Array leeren, statt ein neues Array zuzuweisen
    plan.length = 0;
    patient.medicationPlan = plan;
    speicherePatienten(patientListe);
    render();
  }
});


  // Initial
  render();
});