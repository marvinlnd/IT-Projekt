// javascript/termin.js

// Login-Pop-up Menü: nur die erforderlichen Zeilen

// Elemente selektieren
const loginIcon = document.getElementById('login-icon');
const loginMenu = document.getElementById('login-menu');

// Klick auf das Icon: Menü ein-/ausblenden
loginIcon.addEventListener('click', e => {
  e.stopPropagation();
  const isOpen = loginMenu.classList.toggle('open');
  loginMenu.setAttribute('aria-hidden', !isOpen);
  loginIcon.setAttribute('aria-expanded', isOpen);
});

// Klick außerhalb: Menü schließen
document.addEventListener('click', e => {
  if (!loginIcon.contains(e.target) && !loginMenu.contains(e.target)) {
    loginMenu.classList.remove('open');
    loginMenu.setAttribute('aria-hidden', 'true');
    loginIcon.setAttribute('aria-expanded', 'false');
  }
});

// Menü schließt sich auch, wenn ein Link angeklickt wird
loginMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    loginMenu.classList.remove('open');
    loginMenu.setAttribute('aria-hidden', 'true');
    loginIcon.setAttribute('aria-expanded', 'false');
  });
});

// Firebase initialisieren
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
console.log("✅ Firebase initialisiert!");

const userId = localStorage.getItem("user-id");

document.addEventListener('DOMContentLoaded', async () => {
  const calendarEl = document.getElementById('calendar');
  const formContainer = document.getElementById('event-form-container');

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
    selectable: true,
    editable: true,
    select: onSelectDate,
    dateClick: onDateClick,
    eventClick: onClickEvent
  });
  calendar.render();

  // Events aus Firestore laden
  try {
    const snapshot = await db.collection("users").doc(userId).collection("appointments").get();
    let count = 0;
    snapshot.forEach(doc => {
      const event = doc.data();
      if (event && event.title && event.start) {
        event.id = doc.id;
        calendar.addEvent(event);
        count++;
      } else {
        console.warn("⚠️ Ungültiges Event übersprungen:", event);
      }
    });
    console.log(`✅ ${count} Termine erfolgreich aus Firestore geladen.`);
  } catch (error) {
    console.error("❌ Fehler beim Laden der Termine aus Firestore:", error);
  }

  let activeEvent = null;

  function onSelectDate(info) {
    activeEvent = null;
    openForm({
      title: '',
      start: info.startStr,
      end: info.endStr,
      allDay: info.allDay
    });
    calendar.unselect();
  }

  function onDateClick(info) {
    activeEvent = null;
    openForm({
      title: '',
      start: info.dateStr,
      end: info.dateStr,
      allDay: info.allDay
    });
  }

  function onClickEvent(info) {
    activeEvent = info.event;
    openForm({
      title: activeEvent.title,
      start: activeEvent.startStr || activeEvent.start,
      end: activeEvent.endStr || activeEvent.end,
      allDay: activeEvent.allDay
    }, activeEvent);
  }

  function openForm(data, existingEvent = null) {
    const delBtn = existingEvent
      ? '<button type="button" id="delete-btn" class="delete">Löschen</button>'
      : '';
    formContainer.innerHTML = `
      <form id="event-form">
        <label>Titel:</label>
        <input type="text" id="evt-title" value="${data.title}" required/>
        <label>Start:</label>
        <input type="datetime-local" id="evt-start" value="${toLocalDateTime(data.start)}" required/>
        <label>Ende:</label>
        <input type="datetime-local" id="evt-end" value="${toLocalDateTime(data.end)}" required/>
        <div class="buttons">
          <button type="button" id="cancel-btn">Abbrechen</button>
          ${delBtn}
          <button type="submit" class="save">Speichern</button>
        </div>
      </form>`;
    formContainer.style.display = 'block';

    document.getElementById('cancel-btn').onclick = () => {
      formContainer.style.display = 'none';
    };

    if (existingEvent) {
      document.getElementById('delete-btn').onclick = async () => {
        if (confirm('Termin wirklich löschen?')) {
          existingEvent.remove();
          try {
            await db.collection('users').doc(userId).collection('appointments').doc(existingEvent.id).delete();
            console.log(`✅️ Termin erfolgreich gelöscht: ${existingEvent.id}`);
          } catch (error) {
            console.error("❌ Fehler beim Löschen in Firestore:", error);
          }
          formContainer.style.display = 'none';
        }
      };
    }

    document.getElementById('event-form').onsubmit = async e => {
      e.preventDefault();
      const title = document.getElementById('evt-title').value.trim();
      const start = document.getElementById('evt-start').value;
      const end = document.getElementById('evt-end').value;
      const eventData = { title, start, end, allDay: false };

      if (existingEvent) {
        existingEvent.setProp('title', title);
        existingEvent.setStart(start);
        existingEvent.setEnd(end);
        try {
          await db.collection('users').doc(userId).collection('appointments').doc(existingEvent.id).set({
            id: existingEvent.id,
            ...eventData
          });
          console.log(`✅ Termin erfolgreich aktualisiert: ${existingEvent.id}`);
        } catch (error) {
          console.error("❌ Fehler beim Aktualisieren in Firestore:", error);
        }
      } else {
        const newId = Date.now().toString();
        calendar.addEvent({ ...eventData, id: newId });
        try {
          await db.collection('users').doc(userId).collection('appointments').doc(newId).set({
            id: newId,
            ...eventData
          });
          console.log(`✅ Neuer Termin in Firestore gespeichert: ${newId}`);
        } catch (error) {
          console.error("❌ Fehler beim Speichern des Termins:", error);
        }
      }

      formContainer.style.display = 'none';
    };
  }

  function toLocalDateTime(dateStr) {
    const dt = new Date(dateStr);
    const pad = n => n.toString().padStart(2, '0');
    return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
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
      viewButton.textContent = item.textContent + ' ▾';
      viewDropdown.classList.remove('open');
      viewButton.setAttribute('aria-expanded', 'false');
    });
  });
});
