// Scripts/termin.js

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

window.addEventListener('DOMContentLoaded', async () => {
  console.log('termin.js loaded – Termine aus Firestore laden');

  // FullCalendar instanziieren
  const calendarEl = document.getElementById('calendar');
  const calendar = new FullCalendar.Calendar(calendarEl, {
    locale: 'de',
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'today prev,next',
      center: 'title',
      right: 'dayGridMonth timeGridWeek timeGridDay'
    },
    buttonText: {
      today: 'Heute',
      month: 'Monat',
      week: 'Woche',
      day: 'Tag'
    },
    editable: false,
    selectable: false,
    eventClick: info => {
      const pid = info.event.extendedProps.patientId;
      if (pid) {
        window.location.href = `PatientTermine.html?id=${pid}`;
      }
    }
  });
  calendar.render();

  // Termine aus Firestore laden
  try {
    const snapshot = await db
      .collection('users').doc(userId)
      .collection('appointments').get();

    let count = 0;
    snapshot.forEach(doc => {
      const event = doc.data();
      if (event && event.title && event.start) {
        calendar.addEvent({
          id: doc.id,
          title: event.title,
          start: event.start,
          allDay: event.allDay || false,
          extendedProps: { patientId: event.patientId }
        });
        count++;
      } else {
        console.warn("⚠️ Ungültiges Event übersprungen:", event);
      }
    });
    console.log(`✅ ${count} Termine erfolgreich aus Firestore geladen.`);
  } catch (error) {
    console.error("❌ Fehler beim Laden der Termine aus Firestore:", error);
  }

  // Mobile View-Switcher
  const viewButton = document.getElementById('view-button');
  const viewDropdown = document.getElementById('view-dropdown');
  const viewItems = Array.from(viewDropdown.querySelectorAll('li'));

  viewButton.addEventListener('click', () => {
    const open = viewDropdown.classList.toggle('open');
    viewButton.setAttribute('aria-expanded', open);
  });

  document.addEventListener('click', e => {
    if (!viewButton.contains(e.target) && !viewDropdown.contains(e.target)) {
      viewDropdown.classList.remove('open');
      viewButton.setAttribute('aria-expanded', 'false');
    }
  });

  viewItems.forEach(item => {
    item.addEventListener('click', () => {
      const viewName = item.dataset.view;
      calendar.changeView(viewName);
      viewButton.textContent = `${item.textContent} ▾`;
      viewDropdown.classList.remove('open');
      viewButton.setAttribute('aria-expanded', 'false');
    });
  });
});
