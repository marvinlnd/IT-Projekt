// Firebase initialisieren
const firebaseConfig = {
  apiKey: "AIzaSyAakpWbT87pJ4Bv1Xr0Mk2lCNhNols7KR4",
  authDomain: "it-projekt-ffc4d.firebaseapp.com",
  projectId: "it-projekt-ffc4d",
  storageBucket: "it-projekt-ffc4d.appspot.com", // ✅ Korrigiert!
  messagingSenderId: "534546734981",
  appId: "1:534546734981:web:13bffd7c78893bd0e3aeec"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
console.log("✅ Firebase initialisiert!");

// ------------------------------
// Patient-Klasse
class Patient {
  constructor(vorname = '', nachname = '', email = '', telefon = '', adresse = '', geburtsdatum = '') {
    this.id = Date.now().toString();
    this.personalData = { vorname, nachname, email, telefon, adresse, geburtsdatum };
    this.history = [];
    this.medicationPlan = [];
    this.aerzte = [];
  }
}

const STORAGE_KEY = 'patientListe';
let patientListe = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

function speicherePatienten() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(patientListe));
}

document.addEventListener('DOMContentLoaded', () => {
  const tableBody = document.querySelector('#patient-table tbody');
  const addButton = document.getElementById('add-button');
  const modal = document.getElementById('overview-modal');
  const closeBtn = modal.querySelector('.close');
  const modalName = document.getElementById('modal-name');
  const btnPersonal = document.getElementById('btn-personal');
  const btnHistory = document.getElementById('btn-history');
  const btnMedication = document.getElementById('btn-medication');
  const btnaerzte = document.getElementById('btn-doctor')
  const btnDelete = document.getElementById('btn-delete');
  const searchInput = document.getElementById('search-input');

  const userId = localStorage.getItem("user-id");

  const filterToggle = document.getElementById('filter-toggle');
  const filterDropdown = document.getElementById('filter-dropdown');
  const sortButtons = filterDropdown.querySelectorAll('button');

  let currentSort = 'az';

  // ------------------------------
  // Tabelle rendern
  function renderTable(liste = patientListe) {
    tableBody.innerHTML = '';
    liste.forEach(p => {
      const name = (`${p.personalData.vorname} ${p.personalData.nachname}`.trim()) || '— Unbenannt —';
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${name}</td>`;
      tr.addEventListener('click', () => openModal(p.id));
      tableBody.appendChild(tr);
    });
  }

  // ------------------------------
  // Filter & Sortierung anwenden
  function applyFilterAndSort() {
    const term = searchInput.value.toLowerCase();
    let filtered = patientListe.filter(p => {
      const name = `${p.personalData.vorname} ${p.personalData.nachname}`.toLowerCase();
      return name.includes(term);
    });

    switch (currentSort) {
      case 'az':
        filtered.sort((a, b) => a.personalData.vorname.localeCompare(b.personalData.vorname));
        break;
      case 'za':
        filtered.sort((a, b) => b.personalData.vorname.localeCompare(a.personalData.vorname));
        break;
      case 'neueste':
        filtered.sort((a, b) => parseInt(b.id) - parseInt(a.id));
        break;
      case 'aelteste':
        filtered.sort((a, b) => parseInt(a.id) - parseInt(b.id));
        break;
    }

    renderTable(filtered);
  }

  // ------------------------------
  // Modal öffnen
  function openModal(id) {
    const p = patientListe.find(x => x.id === id);
    if (!p) return;
    modalName.textContent = (`${p.personalData.vorname} ${p.personalData.nachname}`.trim()) || '— Unbenannt —';
    modal.style.display = 'block';
    btnPersonal.onclick = () => location.href = `PersoenlicheDaten.html?id=${id}`;
    btnHistory.onclick = () => location.href = `Krankenhistorie.html?id=${id}`;
    btnMedication.onclick = () => location.href = `Medikationsplan.html?id=${id}`;
    btnaerzte.onclick = () => location.href = `Ärzte.html?id=${id}`;
    btnDelete.onclick = () => deletePatient(id);
  }

  // ------------------------------
  // Patient löschen
  function deletePatient(id) {
    if (!confirm('Möchten Sie diesen Patienten wirklich löschen?')) return;

    const idx = patientListe.findIndex(p => p.id === id);
    if (idx !== -1) {
      const deletedPatient = patientListe.splice(idx, 1)[0];
      speicherePatienten();

      // Firestore löschen
      db.collection('users').doc(userId)
        .collection('patients').doc(deletedPatient.id)
        .delete()
        .then(() => {
          console.log(`✅ Patient mit ID ${deletedPatient.id} aus Firestore gelöscht.`);
        })
        .catch(error => {
          console.error(`❌ Fehler beim Löschen des Patienten aus Firestore:`, error);
        });

      applyFilterAndSort();
      modal.style.display = 'none';
    }
  }

  // ------------------------------
  // Patienten aus Firestore laden
  async function ladePatientenAusFirestore() {
    try {
      const snapshot = await db.collection('users').doc(userId)
        .collection('patients')
        .get();

      patientListe = snapshot.docs.map(doc => doc.data());
      speicherePatienten();
      console.log("✅ Patienten aus Firestore geladen.");
      applyFilterAndSort();
    } catch (error) {
      console.error("❌ Fehler beim Laden der Patienten aus Firestore:", error);
    }
  }

  // ------------------------------
  // Event-Listener
  closeBtn.onclick = () => modal.style.display = 'none';
  window.onclick = e => { if (e.target === modal) modal.style.display = 'none'; };
  addButton.addEventListener('click', () => location.href = 'PersoenlicheDaten.html');
  searchInput.addEventListener('input', applyFilterAndSort);

  filterToggle.addEventListener('click', () => {
    const vis = filterDropdown.style.display === 'block';
    filterDropdown.style.display = vis ? 'none' : 'block';
    sortButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.sort === currentSort);
    });
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

  // ------------------------------
  // Initialisierung
  ladePatientenAusFirestore();
});
