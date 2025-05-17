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
  data.forEach(patient => {
    if (Array.isArray(patient.medicationPlan)) {
      patient.medicationPlan = patient.medicationPlan.map(m =>
        new Medikation(m.medikament, m.anzahl, m.tageszeit, m.wochentage)
      );
    }
  });
  return data;
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

  const nameElem = document.getElementById('patient-name');
  const { vorname = '', nachname = '' } = patient.personalData;
  nameElem.textContent = `Patient: ${vorname} ${nachname}`.trim();

  const plan = patient.medicationPlan;

  const formSection = document.querySelector('.form-section');
  const nameIn       = document.getElementById('medikament');
  const anzahlIn     = document.getElementById('anzahl');
  const einheitIn    = document.getElementById('einheit');
  const tageszeitIn  = document.getElementById('tageszeit');
  const wochentageIn = document.getElementById('wochentage');
  const addBtn       = document.getElementById('add-med');

  const idxSelect    = document.getElementById('indexDropdown');
  const newNameIn    = document.getElementById('neuesMedikament');
  const newAnzahlIn  = document.getElementById('neueAnzahl');
  const neueEinheitIn= document.getElementById('neueEinheit');
  const newZeitIn    = document.getElementById('neueTageszeit');
  const newWochIn    = document.getElementById('neueWochentage');
  const editBtn      = document.getElementById('edit-med');

  const delSelect    = document.getElementById('indexLoeschenDropdown');
  const deleteBtn    = document.getElementById('delete-med');
  const clearBtn     = document.getElementById('clear-med');

  const tableBody    = document.querySelector('#medikationsTabelle tbody');

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

  function validateAnzahl(val) {
    return /^\d+(?:[\.,]\d+)?$/.test(val.trim());
  }
  function validateName(val) {
    return val.trim().length >= 2;
  }
  function validateWochentage(val) {
    const allowed = ['Mo','Di','Mi','Do','Fr','Sa','So'];
    const parts = val.split(',').map(p => p.trim());
    return parts.length > 0 && parts.every(p => allowed.includes(p));
  }

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

  idxSelect.addEventListener('change', () => {
    clearErrors();
    const i = parseInt(idxSelect.value,10);
    if (!isNaN(i) && i>=0 && i<plan.length) {
      newNameIn.value    = plan[i].medikament;
      const [anzahl, ...einheit] = plan[i].anzahl.split(' ');
      newAnzahlIn.value  = anzahl;
      neueEinheitIn.value= einheit.join(' ');
      newZeitIn.value    = plan[i].tageszeit;
      newWochIn.value    = plan[i].wochentage;
    }
  });

  addBtn.addEventListener('click', () => {
    clearErrors();
    let ok = true;
    if (!validateName(nameIn.value))    { showError(nameIn,'Medikamentname mind. 2 Zeichen'); ok=false; }
    if (!validateAnzahl(anzahlIn.value)){ showError(anzahlIn,'Ungültige Dosierung'); ok=false; }
    if (!validateWochentage(wochentageIn.value)){ showError(wochentageIn,'Wochentage: Mo,Di,Mi,Do,Fr,Sa,So'); ok=false; }
    if (!ok) return;

    const dosierung = `${anzahlIn.value.trim()} ${einheitIn.value}`;
    plan.push(new Medikation(nameIn.value.trim(), dosierung, tageszeitIn.value.trim(), wochentageIn.value.trim()));
    speicherePatienten(patientListe);
    render();
    nameIn.value = anzahlIn.value = tageszeitIn.value = wochentageIn.value = '';
    einheitIn.selectedIndex = 0;
  });

  editBtn.addEventListener('click', () => {
    clearErrors();
    const i = parseInt(idxSelect.value,10);
    if (isNaN(i)||i<0||i>=plan.length) { showError(idxSelect,'Ungültiger Index'); return; }

    let ok = true;
    if (newNameIn.value && !validateName(newNameIn.value))        { showError(newNameIn,'Medikamentname mind. 2 Zeichen'); ok=false; }
    if (newAnzahlIn.value && !validateAnzahl(newAnzahlIn.value))  { showError(newAnzahlIn,'Ungültige Dosierung'); ok=false; }
    if (newWochIn.value && !validateWochentage(newWochIn.value))  { showError(newWochIn,'Wochentage: Mo,Di,Mi,Do,Fr,Sa,So'); ok=false; }
    if (!ok) return;

    const neueDosierung = `${newAnzahlIn.value.trim()} ${neueEinheitIn.value}`;
    plan[i].aktualisieren({
      medikament: newNameIn.value.trim(),
      anzahl: neueDosierung,
      tageszeit: newZeitIn.value.trim(),
      wochentage: newWochIn.value.trim()
    });
    speicherePatienten(patientListe);
    render();
    newNameIn.value = newAnzahlIn.value = newZeitIn.value = newWochIn.value = '';
    neueEinheitIn.selectedIndex = 0;
  });

  deleteBtn.addEventListener('click', () => {
    const i = parseInt(delSelect.value,10);
    if (isNaN(i)||i<0||i>=plan.length) return;
    plan.splice(i,1);
    speicherePatienten(patientListe);
    render();
  });

  clearBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (confirm('Wirklich alle Einträge löschen?')) {
      plan.length = 0;
      patient.medicationPlan = plan;
      speicherePatienten(patientListe);
      render();
    }
  });

  render();
});
