// Scripts/PatientTermine.js – Termine eines einzelnen Patienten mit Firestore

window.addEventListener('DOMContentLoaded', async () => {
  console.log('PatientTermine.js geladen – Firestore-Integration');

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
  const userId = localStorage.getItem("user-id");

  // — Login-Popup-Menü —
  const loginIcon = document.getElementById('login-icon');
  const loginMenu = document.getElementById('login-menu');
  if (loginIcon && loginMenu) {
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
  } else {
    console.warn('Login elements not found');
  }

  // — Helper: URL-Parameter auslesen —
  function getParam(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  // Patienten-ID
  const patientId = getParam('id') || 'default';

  // DOM-Elemente
  const nameSpan     = document.getElementById('patient-name');
  const addBtn       = document.getElementById('add-termin');
  const tableBody    = document.querySelector('#termin-table tbody');
  const modal        = document.getElementById('termin-modal');
  const modalContent = modal?.querySelector('.modal-content');
  const closeBtn     = modal?.querySelector('.close');
  const form         = document.getElementById('termin-form');
  const fldTitle     = document.getElementById('evt-title');
  const fldStart     = document.getElementById('evt-start');
  const btnCancel    = document.getElementById('cancel-btn');
  const btnDelete    = document.getElementById('delete-btn');
  const searchInput  = document.getElementById('search-input');
  const searchBtn    = document.getElementById('search-button');
  let currentId      = null;

  // Patientenname anzeigen
  (function loadPatientName() {
    const patients = JSON.parse(localStorage.getItem('patientListe')) || [];
    const patient  = patients.find(p => p.id === patientId);
    nameSpan.textContent = patient
      ? `${patient.personalData.vorname} ${patient.personalData.nachname}`
      : 'Patient';
  })();

  // Event-Listener registrieren
  if (addBtn)       addBtn.addEventListener('click', () => openModal());
  if (closeBtn)     closeBtn.addEventListener('click', closeModal);
  if (btnCancel)    btnCancel.addEventListener('click', closeModal);
  if (btnDelete)    btnDelete.addEventListener('click', () => {
                       if (confirm('Termin wirklich löschen?')) deleteTermin();
                     });
  if (form)         form.addEventListener('submit', saveTermin);
  if (searchBtn)    searchBtn.addEventListener('click', () => applySearch());
  if (searchInput)  searchInput.addEventListener('keyup', e => {
                       if (e.key === 'Enter') applySearch();
                     });

  // Termine initial laden
  await loadTermine();

  /** Lädt und rendert alle Termine aus Firestore */
  async function loadTermine(filter = '') {
    try {
      const snapshot = await db
        .collection('users').doc(userId)
        .collection('appointments')
        .where('patientId', '==', patientId)
        .get();

      let termine = snapshot.docs.map(doc => {
        const data = doc.data();
        return { id: doc.id, title: data.title, start: data.start };
      });

      // Sortieren nach Datum
      termine.sort((a, b) => new Date(a.start) - new Date(b.start));

      // Filter nach Titel
      if (filter) {
        const q = filter.toLowerCase();
        termine = termine.filter(t => t.title.toLowerCase().includes(q));
      }

      renderTermine(termine);
    } catch (error) {
      console.error("❌ Fehler beim Laden der Termine aus Firestore:", error);
      renderTermine([]);
    }
  }

  /** Rendert die übergebenen Termine in der Tabelle */
  function renderTermine(termine) {
    tableBody.innerHTML = '';
    termine.forEach(evt => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${evt.title}</td>
        <td>${new Date(evt.start).toLocaleString(undefined, {
          year: 'numeric', month: '2-digit', day: '2-digit',
          hour: '2-digit', minute: '2-digit', hour12: false
        })}</td>
        <td>
          <button class="btn edit" data-id="${evt.id}">✎</button>
          <button class="btn delete" data-id="${evt.id}">🗑</button>
        </td>`;
      tableBody.appendChild(tr);
    });

    // Edit-Buttons
    document.querySelectorAll('#termin-table .edit')
      .forEach(btn => btn.addEventListener('click', () => openModal(btn.dataset.id)));

    // Delete-Buttons
    document.querySelectorAll('#termin-table .delete')
      .forEach(btn => btn.addEventListener('click', () => {
        currentId = btn.dataset.id;
        if (confirm('Termin wirklich löschen?')) deleteTermin();
      }));
  }

  /** Suchfilter anwenden */
  function applySearch() {
    loadTermine(searchInput.value.trim());
  }

  /** Modal öffnen (neu oder bestehend) */
  async function openModal(id = null) {
    currentId = id;
    if (modalContent) {
      modalContent.style.background = '#004aad';
      modalContent.style.color = '#fff';
    }

    if (id) {
      try {
        const doc = await db
          .collection('users').doc(userId)
          .collection('appointments')
          .doc(id).get();
        const evt = doc.data() || {};
        fldTitle.value = evt.title || '';
        fldStart.value = evt.start || '';
      } catch (error) {
        console.error("❌ Fehler beim Laden des Termins:", error);
      }
      if (btnDelete) btnDelete.style.display = 'inline-block';
      form.dataset.editing = id;
    } else {
      fldTitle.value = '';
      fldStart.value = '';
      if (btnDelete) btnDelete.style.display = 'none';
      delete form.dataset.editing;
    }

    modal.style.display = 'block';
  }

  /** Modal schließen */
  function closeModal() {
    modal.style.display = 'none';
  }

  /** Speichert neuen oder bearbeiteten Termin in Firestore */
  async function saveTermin(e) {
    e.preventDefault();
    const isEdit = !!form.dataset.editing;
    const collRef = db.collection('users').doc(userId).collection('appointments');
    const docRef = isEdit
      ? collRef.doc(form.dataset.editing)
      : collRef.doc(); // neue ID

    const data = {
      title: fldTitle.value.trim(),
      start: fldStart.value,
      patientId
    };

    try {
      await docRef.set(data);
      console.log(`✅ Termin ${isEdit ? 'aktualisiert' : 'angelegt'}:`, docRef.id);
    } catch (error) {
      console.error("❌ Fehler beim Speichern des Termins:", error);
    }

    closeModal();
    loadTermine(searchInput.value.trim());
  }

  /** Löscht einen Termin in Firestore */
  async function deleteTermin() {
    try {
      await db
        .collection('users').doc(userId)
        .collection('appointments')
        .doc(currentId)
        .delete();
      console.log(`✅ Termin gelöscht: ${currentId}`);
    } catch (error) {
      console.error("❌ Fehler beim Löschen des Termins:", error);
    }
    closeModal();
    loadTermine(searchInput.value.trim());
  }
});
