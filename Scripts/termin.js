// javascript/termin.js

document.addEventListener('DOMContentLoaded', () => {
  const calendarEl    = document.getElementById('calendar');
  const formContainer = document.getElementById('event-form-container');

  // FullCalendar initialisieren (inkl. dateClick für alle Ansichten)
  const calendar = new FullCalendar.Calendar(calendarEl, {
    locale: 'de',
    initialView: 'dayGridMonth',
    headerToolbar: {
      left:  'today prev,next',
      center:'title',
      right: 'dayGridMonth timeGridWeek timeGridDay'
    },
    buttonText: {
      today: 'Heute',
      month: 'Monat',
      week:  'Woche',
      day:   'Tag'
    },
    selectable: true,
    editable:   true,
    select:     onSelectDate,
    dateClick:  onDateClick,
    eventClick: onClickEvent
  });
  calendar.render();

  // ========== Öffnen des Formulars ==========
  let activeEvent = null;
  function onSelectDate(info) {
    activeEvent = null;
    openForm({
      title:  '',
      start:  info.startStr,
      end:    info.endStr,
      allDay: info.allDay
    });
    calendar.unselect();
  }
  function onDateClick(info) {
    activeEvent = null;
    openForm({
      title:  '',
      start:  info.dateStr,
      end:    info.dateStr,
      allDay: info.allDay
    });
  }
  function onClickEvent(info) {
    activeEvent = info.event;
    openForm({
      title:  activeEvent.title,
      start:  activeEvent.startStr || activeEvent.start,
      end:    activeEvent.endStr   || activeEvent.end,
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
        <input type="datetime-local" id="evt-end"   value="${toLocalDateTime(data.end)}"   required/>
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
      document.getElementById('delete-btn').onclick = () => {
        if (confirm('Termin wirklich löschen?')) {
          existingEvent.remove();
          formContainer.style.display = 'none';
        }
      };
    }
    document.getElementById('event-form').onsubmit = e => {
      e.preventDefault();
      const title = document.getElementById('evt-title').value;
      const start = document.getElementById('evt-start').value;
      const end   = document.getElementById('evt-end').value;
      if (existingEvent) {
        existingEvent.setProp('title', title);
        existingEvent.setStart(start);
        existingEvent.setEnd(end);
      } else {
        calendar.addEvent({ title, start, end, allDay: false });
      }
      formContainer.style.display = 'none';
    };
  }

  // Hilfsfunktion für datetime-local
  function toLocalDateTime(dateStr) {
    const dt = new Date(dateStr);
    const pad = n => n.toString().padStart(2,'0');
    return `${dt.getFullYear()}-${pad(dt.getMonth()+1)}-${pad(dt.getDate())}` +
           `T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
  }

  // ========== Mobile View-Switcher ==========
  const viewButton   = document.getElementById('view-button');
  const viewDropdown = document.getElementById('view-dropdown');
  const viewItems    = Array.from(viewDropdown.querySelectorAll('li'));

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

  // ===== Sprache & Login (aus globalem script.js) =====
  initLanguageSwitcher();
  initLoginRedirect();
});
