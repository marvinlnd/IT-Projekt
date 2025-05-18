class Patient {
  constructor(vorname, nachname, email, telefon, adresse, geburtsdatum) {
    this.id = Date.now().toString();
    this.personalData = { vorname, nachname, email, telefon, adresse, geburtsdatum };
    this.history = [];
    this.medicationPlan = [];
  }
}

const STORAGE_KEY = 'patientListe';
let patientListe = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(location.search);
  const id = params.get('id'); // wenn vorhanden: Bearbeiten, sonst Neuanlage
  const form = document.getElementById('personal-form');
  const cancel = document.getElementById('cancel');

  // Felder
  const vorname = form.vorname;
  const nachname = form.nachname;
  const email = form.email;
  const telefon = form.telefon;
  const adresse = form.adresse;
  const geburtsdatum = form.geburtsdatum;

  let patient;
  if (id) {
    // Bearbeiten
    patient = patientListe.find(p => p.id === id);
    if (patient) {
      Object.entries(patient.personalData).forEach(([key, val]) => {
        if (form[key]) form[key].value = val;
      });
    }
  }

  function clearErrors() {
    form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
    form.querySelectorAll('.error-message').forEach(el => el.remove());
  }

  function showError(input, message) {
    input.classList.add('error');
    const msg = document.createElement('div');
    msg.className = 'error-message';
    msg.textContent = message;
    input.insertAdjacentElement('afterend', msg);
  }

  function validateName(val) {
  const trimmed = val.trim();
  const namePattern = /^[\p{L}]+(?:[\s\-][\p{L}]+)*$/u;
  return trimmed.length >= 2 && namePattern.test(trimmed);
  }

  function validateEmail(val) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  }

  function validateTelefon(val) {
    return /^[+]?[\d\s\-()]{6,}$/.test(val.trim());
  }

  function validateGeburtsdatum(val) {
  const trimmed = val.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return false;

  const date = new Date(trimmed);
  const [year, month, day] = trimmed.split('-').map(Number);

  // Gültiges Datum prüfen
  if (
    date.getFullYear() !== year ||
    date.getMonth() + 1 !== month ||
    date.getDate() !== day
  ) {
    return false;
  }

  const today = new Date();
  const minDate = new Date(today.getFullYear() - 130, today.getMonth(), today.getDate());

  // Nicht älter als 130 Jahre & nicht in der Zukunft
  return date >= minDate && date <= today;
  }


  form.addEventListener('submit', e => {
    e.preventDefault();
    clearErrors();

    let ok = true;

    if (!validateName(vorname.value)) {
      showError(vorname, 'Mindestens 2 Zeichen, keine Zahlen oder Sonderzeichen');
      ok = false;
    }

    if (!validateName(nachname.value)) {
      showError(nachname, 'Mindestens 2 Zeichen, keine Zahlen oder Sonderzeichen');
      ok = false;
    }

    if (!validateEmail(email.value)) {
      showError(email, 'Ungültige E-Mail-Adresse');
      ok = false;
    }

    if (!validateTelefon(telefon.value)) {
      showError(telefon, 'Ungültige Telefonnummer');
      ok = false;
    }

    if (adresse.value.trim().length < 5) {
      showError(adresse, 'Adresse muss mindestens 5 Zeichen haben');
      ok = false;
    }

    if (!validateGeburtsdatum(geburtsdatum.value)) {
      showError(geburtsdatum, 'Geburtsdatum muss realistisch und im Format TT-MM-JJJJ sein ');
      ok = false;
    }

    if (!ok) return;

    const data = {
      vorname: vorname.value.trim(),
      nachname: nachname.value.trim(),
      email: email.value.trim(),
      telefon: telefon.value.trim(),
      adresse: adresse.value.trim(),
      geburtsdatum: geburtsdatum.value.trim()
    };

    if (patient) {
      // Update vorhandener
      patient.personalData = data;
    } else {
      // Neuen anlegen
      const neu = new Patient(...Object.values(data));
      patientListe.push(neu);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(patientListe));
    location.href = 'Patienten.html';
  });

  cancel.addEventListener('click', () => {
    location.href = 'Patienten.html';
  });
});
