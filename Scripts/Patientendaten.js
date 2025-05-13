// javascript/Patientendaten.js

class Patient {
  constructor(vorname = '', nachname = '', email = '', telefon = '', adresse = '', geburtsdatum = '') {
    this.id = Date.now().toString();
    this.personalData = { vorname, nachname, email, telefon, adresse, geburtsdatum };
    this.history = [];
    this.medicationPlan = [];
  }
}

const STORAGE_KEY = 'patientListe';
let patientListe = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

function speicherePatienten() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(patientListe));
}

document.addEventListener('DOMContentLoaded', () => {
  const tableBody     = document.querySelector('#patient-table tbody');
  const addButton     = document.getElementById('add-button');
  const modal         = document.getElementById('overview-modal');
  const closeBtn      = modal.querySelector('.close');
  const modalName     = document.getElementById('modal-name');
  const btnPersonal   = document.getElementById('btn-personal');
  const btnHistory    = document.getElementById('btn-history');
  const btnMedication = document.getElementById('btn-medication');
  const btnDelete     = document.getElementById('btn-delete');
  const searchInput   = document.getElementById('search-input');

  const filterToggle   = document.getElementById('filter-toggle');
  const filterDropdown = document.getElementById('filter-dropdown');
  const sortButtons    = filterDropdown.querySelectorAll('button');

  let currentSort = 'az';

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

  function openModal(id) {
    const p = patientListe.find(x => x.id === id);
    if (!p) return;
    modalName.textContent = (`${p.personalData.vorname} ${p.personalData.nachname}`.trim()) || '— Unbenannt —';
    modal.style.display = 'block';
    btnPersonal.onclick   = () => location.href = `PersoenlicheDaten.html?id=${id}`;
    btnHistory.onclick    = () => location.href = `Krankenhistorie.html?id=${id}`;
    btnMedication.onclick = () => location.href = `Medikationsplan.html?id=${id}`;
    btnDelete.onclick     = () => deletePatient(id);
  }

  function deletePatient(id) {
  if (!confirm('Möchten Sie diesen Patienten wirklich löschen?')) {
    return; // Abbruch, wenn der Nutzer „Abbrechen“ klickt
  }
  const idx = patientListe.findIndex(p => p.id === id);
  if (idx !== -1) {
    patientListe.splice(idx, 1);
    speicherePatienten();
    applyFilterAndSort();
    modal.style.display = 'none';
  }
}


  function applyFilterAndSort() {
    const term = searchInput.value.toLowerCase();
    let filtered = patientListe.filter(p => {
      const name = `${p.personalData.vorname} ${p.personalData.nachname}`.toLowerCase();
      return name.includes(term);
    });
    switch (currentSort) {
      case 'az':
        filtered.sort((a,b) =>
          (`${a.personalData.vorname}`).localeCompare(`${b.personalData.vorname}`)
        );
        break;
      case 'za':
        filtered.sort((a,b) =>
          (`${b.personalData.vorname}`).localeCompare(`${a.personalData.vorname}`)
        );
        break;
      case 'neueste':
        filtered.sort((a,b) => parseInt(b.id) - parseInt(a.id));
        break;
      case 'aelteste':
        filtered.sort((a,b) => parseInt(a.id) - parseInt(b.id));
        break;
    }
    renderTable(filtered);
  }

  // Modal schließen
  closeBtn.onclick = () => modal.style.display = 'none';
  window.onclick = e => { if (e.target === modal) modal.style.display = 'none'; };

  // Neuer Patient
  addButton.addEventListener('click', () => {
    location.href = 'PersoenlicheDaten.html';
  });

  // Suche
  searchInput.addEventListener('input', applyFilterAndSort);

  // Sortier-Dropdown
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

  // initial render
  applyFilterAndSort();
});
