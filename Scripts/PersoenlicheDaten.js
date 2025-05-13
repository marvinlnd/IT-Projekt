// javascript/persoenlicheDaten.js

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
  
    form.addEventListener('submit', e => {
      e.preventDefault();
      const data = {
        vorname:      form.vorname.value.trim(),
        nachname:     form.nachname.value.trim(),
        email:        form.email.value.trim(),
        telefon:      form.telefon.value.trim(),
        adresse:      form.adresse.value.trim(),
        geburtsdatum: form.geburtsdatum.value
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
      // zurück zur Liste
      location.href = 'Patienten.html';
    });
  
    cancel.addEventListener('click', () => {
      // einfach zurück zur Liste ohne Anlegen / Änderungen
      location.href = 'Patienten.html';
    });
  });
  