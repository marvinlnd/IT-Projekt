// Login-Pop-up Menü
const loginIcon = document.getElementById('login-icon');
const loginMenu = document.getElementById('login-menu');

loginIcon.addEventListener('click', e => {
  e.stopPropagation();
  const isOpen = loginMenu.classList.toggle('open');
  loginMenu.setAttribute('aria-hidden', !isOpen);
  loginIcon.setAttribute('aria-expanded', isOpen);
});

document.addEventListener('click', e => {
  if (!loginIcon.contains(e.target) && !loginMenu.contains(e.target)) {
    loginMenu.classList.remove('open');
    loginMenu.setAttribute('aria-hidden', 'true');
    loginIcon.setAttribute('aria-expanded', 'false');
  }
});

loginMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    loginMenu.classList.remove('open');
    loginMenu.setAttribute('aria-hidden', 'true');
    loginIcon.setAttribute('aria-expanded', 'false');
  });
});

// Firebase Initialisierung
const firebaseConfig = {
  apiKey: "AIzaSyAakpWbT87pJ4Bv1Xr0Mk2lCNhNols7KR4",
  authDomain: "it-projekt-ffc4d.firebaseapp.com",
  projectId: "it-projekt-ffc4d",
  storageBucket: "it-projekt-ffc4d.appspot.com",
  messagingSenderId: "534546734981",
  appId: "1:534546734981:web:13bffd7c78893bd0e3aeec"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
console.log("✅ Firebase für Aktivitäten initialisiert!");

const userId = localStorage.getItem("user-id");
const params = new URLSearchParams(location.search);
const patientId = params.get('id');
if (!patientId) {
  console.error("❌ Kein Patient-ID in der URL gefunden.");
}

const STORAGE_KEY = 'patientListe';

function ladePatienten() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

function speicherePatienten(liste) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(liste));
}

class Aktivität {
  constructor(datum, nameDerAktivität, beginn, ende, notitz) {
    this.datum = datum;
    this.nameDerAktivität = nameDerAktivität;
    this.beginn = beginn;
    this.ende = ende;
    this.notitz = notitz;
  }
}

let aktivitäten = [];
const datumInput = document.getElementById("date");
const nameInput = document.getElementById("nameDerAktivität");
const beginnInput = document.getElementById("beginn");
const endeInput = document.getElementById("ende");
const notitzInput = document.getElementById("notitz");

// Fehleranzeigen
function showError(elem, msg) {
  elem.style.borderColor = 'red';
  elem.title = msg;

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
  document.querySelectorAll('.error-message').forEach(e => e.remove());
  [datumInput, nameInput, beginnInput, endeInput].forEach(el => {
    el.style.borderColor = '';
    el.title = '';
  });
}

function validateName(name) {
  return typeof name === 'string' && name.trim().length >= 2;
}

function validateZeitFormat(zeit) {
  return /^\d{2}:\d{2}$/.test(zeit);
}

function validateInputs(datum, name, beginn, ende, datumInput, nameInput, beginnInput, endeInput) {
  clearErrors();
  let ok = true;

  if (!datum) {
    showError(datumInput, 'Datum erforderlich');
    ok = false;
  }
  if (!validateName(name)) {
    showError(nameInput, 'Aktivitätsname mind. 2 Zeichen');
    ok = false;
  }
  if (!validateZeitFormat(beginn)) {
    showError(beginnInput, 'Zeitformat: HH:MM');
    ok = false;
  }
  if (!validateZeitFormat(ende)) {
    showError(endeInput, 'Zeitformat: HH:MM');
    ok = false;
  }
  return ok;
}

document.getElementById("add-button").addEventListener("click", () => {
  aktivitätHinzufügen(
    datumInput.value,
    nameInput.value,
    beginnInput.value,
    endeInput.value,
    notitzInput.value
  );
});

// Firestore Laden
async function ladeAktivitätenVonFirestore() {
  if (!userId || !patientId) return console.error("❌ Benutzer- oder Patient-ID fehlt!");

  try {
    const snapshot = await db.collection('users').doc(userId)
      .collection('patients').doc(patientId)
      .collection('aktivitäten').get();
    const geladen = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const patienten = ladePatienten();
    const patient = patienten.find(p => p.id === patientId);
    if (patient) {
      patient.aktivitäten = geladen;
      speicherePatienten(patienten);
    }

    aktivitäten = geladen;
    applyFilterAndSort();
    console.log("✅ Aktivitäten von Firestore geladen.");
  } catch (err) {
    console.error("❌ Fehler beim Laden aus Firestore:", err.message);
  }
}

// Hinzufügen
async function aktivitätHinzufügen(datum, name, beginn, ende, notitz) {
  if (!validateInputs(datum, name, beginn, ende, datumInput, nameInput, beginnInput, endeInput)) return;

  const neueAktivität = { datum, nameDerAktivität: name, beginn, ende, notitz };
  try {
    const docRef = await db.collection('users').doc(userId)
      .collection('patients').doc(patientId)
      .collection('aktivitäten').add(neueAktivität);
    neueAktivität.id = docRef.id;
    aktivitäten.push(neueAktivität);

    const patienten = ladePatienten();
    const patient = patienten.find(p => p.id === patientId);
    if (patient) {
      if (!Array.isArray(patient.aktivitäten)) patient.aktivitäten = [];
      patient.aktivitäten.push(neueAktivität);
      speicherePatienten(patienten);
    }

    applyFilterAndSort();
  } catch (error) {
    console.error("❌ Fehler beim Hinzufügen:", error);
  }
}

// Bearbeiten
async function aktivität_bearbeiten(index, datum, neuerName, neuBeginn, neuEnde, neueNotitz) {
  const eintrag = aktivitäten[index];
  if (!eintrag?.id) return console.warn("❗ Keine gültige Aktivität!");

  const aktualisiert = {
    datum,
    nameDerAktivität: neuerName,
    beginn: neuBeginn,
    ende: neuEnde,
    notitz: neueNotitz
  };

  try {
    await db.collection('users').doc(userId)
      .collection('patients').doc(patientId)
      .collection('aktivitäten').doc(eintrag.id).set(aktualisiert);
    Object.assign(eintrag, aktualisiert);

    const patienten = ladePatienten();
    const patient = patienten.find(p => p.id === patientId);
    if (patient && Array.isArray(patient.aktivitäten)) {
      const idx = patient.aktivitäten.findIndex(a => a.id === eintrag.id);
      if (idx >= 0) patient.aktivitäten[idx] = eintrag;
      speicherePatienten(patienten);
    }

    applyFilterAndSort();
  } catch (error) {
    console.error("❌ Fehler beim Bearbeiten:", error);
  }
}

// Löschen
async function aktivität_loeschen(index) {
  const eintrag = aktivitäten[index];
  if (!eintrag?.id) return alert("❗ Ungültiger Index oder ID!");

  if (confirm("❓ Willst du diese Aktivität wirklich löschen?")) {
    try {
      await db.collection("users").doc(userId)
        .collection("patients").doc(patientId)
        .collection("aktivitäten").doc(eintrag.id).delete();
      aktivitäten.splice(index, 1);

      const patienten = ladePatienten();
      const patient = patienten.find(p => p.id === patientId);
      if (patient && Array.isArray(patient.aktivitäten)) {
        const idx = patient.aktivitäten.findIndex(a => a.id === eintrag.id);
        if (idx >= 0) patient.aktivitäten.splice(idx, 1);
        speicherePatienten(patienten);
      }

      applyFilterAndSort();
    } catch (error) {
      console.error("❌ Fehler beim Löschen:", error);
    }
  }
}

// Tabelle aktualisieren
function aktualisiereTabelle(liste = aktivitäten) {
  const tbody = document.querySelector("#aktivitätenTabelle tbody");
  tbody.innerHTML = "";

  liste.forEach((eintrag, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${eintrag.datum || ''}</td>
      <td>${eintrag.nameDerAktivität}</td>
      <td>${eintrag.beginn}</td>
      <td>${eintrag.ende}</td>
      <td>${eintrag.notitz}</td>
    `;

    row.addEventListener("click", event => {
      tbody.querySelectorAll("tr").forEach(r => r.classList.remove("selected"));
      row.classList.add("selected");

      const menu = document.getElementById("context-menu");
      menu.style.display = "block";
      menu.style.left = `${event.pageX + 5}px`;
      menu.style.top = `${event.pageY + 5}px`;

      document.getElementById("edit-button").onclick = () => {
        const modal = document.getElementById("edit-modal-overlay");
        const dateIn = document.getElementById("modal-datum");
        const nameIn = document.getElementById("modal-name");
        const beginnIn = document.getElementById("modal-beginn");
        const endeIn = document.getElementById("modal-ende");
        const noteIn = document.getElementById("modal-Notiz");
        const saveBtn = document.getElementById("modal-save");
        const cancelBtn = document.getElementById("modal-cancel");

        dateIn.value = eintrag.datum || "";
        nameIn.value = eintrag.nameDerAktivität;
        beginnIn.value = eintrag.beginn;
        endeIn.value = eintrag.ende;
        noteIn.value = eintrag.notitz;

        modal.style.display = "flex";
        menu.style.display = "none";

        saveBtn.onclick = async () => {
          let ok = true;
          if (!dateIn.value) { showError(dateIn, 'Datum erforderlich'); ok = false; }
          if (!validateName(nameIn.value)) { showError(nameIn, 'mind. 2 Zeichen'); ok = false; }
          if (!validateZeitFormat(beginnIn.value)) { showError(beginnIn, 'HH:MM'); ok = false; }
          if (!validateZeitFormat(endeIn.value)) { showError(endeIn, 'HH:MM'); ok = false; }
          if (!ok) return;
          await aktivität_bearbeiten(index, dateIn.value, nameIn.value, beginnIn.value, endeIn.value, noteIn.value);
          modal.style.display = "none";
        };

        cancelBtn.onclick = () => modal.style.display = "none";
      };

      document.getElementById("delete-button").onclick = async () => {
        await aktivität_loeschen(index);
        menu.style.display = "none";
      };
    });

    tbody.appendChild(row);
  });
}

// Initial Laden
document.addEventListener("DOMContentLoaded", async () => {
  const patienten = ladePatienten();
  const patient = patienten.find(p => p.id === patientId);
  aktivitäten = (patient && Array.isArray(patient.aktivitäten)) ? patient.aktivitäten : [];
  applyFilterAndSort();
    const nameElem = document.getElementById('patient-name');
  const { vorname = '', nachname = '' } = patient.personalData || {};
  nameElem.textContent = `Patient: ${vorname} ${nachname}`.trim();

  await ladeAktivitätenVonFirestore();
});

document.addEventListener('click', (e) => {
  const menu = document.getElementById('context-menu');
  if (!menu.contains(e.target) && !e.target.closest('tr')) {
    menu.style.display = 'none';
  }

});

// Filter & Sortierung
const filterToggle = document.getElementById("filter-toggle");
const filterDropdown = document.getElementById("filter-dropdown");
const sortButtons = document.querySelectorAll(".sort-button");
let currentSort = "neueste";

function applyFilterAndSort() {
  const sorted = [...aktivitäten].sort((a, b) => new Date(b.datum) - new Date(a.datum));
  aktualisiereTabelle(sorted);
}

filterToggle.addEventListener('click', () => {
  filterDropdown.style.display = filterDropdown.style.display === 'block' ? 'none' : 'block';
  sortButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.sort === currentSort));
});

document.addEventListener('click', e => {
  if (!filterDropdown.contains(e.target) && !filterToggle.contains(e.target)) {
    filterDropdown.style.display = 'none';
  }
});



sortButtons.forEach(button => {
  button.addEventListener('click', () => {
    currentSort = button.dataset.sort;
    sortButtons.forEach(btn => btn.classList.toggle('active', btn === button));
    filterDropdown.style.display = 'none';
    applyFilterAndSort();
  });
});
