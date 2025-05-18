// javascript/PersoenlicheDaten.js

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
  const id     = params.get('id');        // wenn vorhanden: Bearbeiten, sonst Neuanlage
  const form   = document.getElementById('personal-form');
  const cancel = document.getElementById('cancel');

  // Fehler-Handling-Funktionen
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

  let patient;
  if (id) {
    patient = patientListe.find(p => p.id === id);
    if (patient) {
      Object.entries(patient.personalData).forEach(([key, val]) => {
        if (form[key]) form[key].value = val;
      });
    }
  }

  // Validierungen (z.B. Name, Email) können hier bei Bedarf ergänzt werden (wie im Original)

  form.addEventListener('submit', async e => {
    e.preventDefault();
    clearErrors();

    let ok = true;

    // Beispiel-Validierung für Vorname (kann für weitere Felder ergänzt werden)
    if (form.vorname.value.trim().length < 2) {
      showError(form.vorname, 'Mindestens 2 Zeichen');
      ok = false;
    }
    if (form.nachname.value.trim().length < 2) {
      showError(form.nachname, 'Mindestens 2 Zeichen');
      ok = false;
    }
    // Weitere Validierungen können hier analog ergänzt werden

    if (!ok) return;

    const data = {
      vorname:      form.vorname.value.trim(),
      nachname:     form.nachname.value.trim(),
      email:        form.email.value.trim(),
      telefon:      form.telefon.value.trim(),
      adresse:      form.adresse.value.trim(),
      geburtsdatum: form.geburtsdatum.value
    };

    if (patient) {
      // Update vorhandener Patient
      patient.personalData = data;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(patientListe));
      console.log(`✏️ Patientendaten aktualisiert: ${patient.id}`);

      try {
        await db.collection('patients').doc(patient.id).set(JSON.parse(JSON.stringify(patient)));
        console.log(`✅ Patient ${patient.id} in Firestore aktualisiert.`);
      } catch (error) {
        console.error("❌ Fehler beim Aktualisieren in Firestore:", error);
      }
    } else {
      // Neuen Patient anlegen
      const neu = new Patient(...Object.values(data));
      patientListe.push(neu);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(patientListe));
      console.log(`✅ Neuer Patient wird angelegt:`, neu);

      try {
        await db.collection('patients').doc(neu.id).set(JSON.parse(JSON.stringify(neu)));
        console.log(`✅ Neuer Patient ${neu.id} in Firestore gespeichert.`);
      } catch (error) {
        console.error("❌ Fehler beim Speichern in Firestore:", error);
      }
    }

    location.href = 'Patienten.html';
  });

  cancel.addEventListener('click', () => {
    location.href = 'Patienten.html';
  });
});
