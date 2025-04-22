// Terminverwaltung mit FullCalendar und Inline-Formular

document.addEventListener('DOMContentLoaded', () => {
    const calendarEl = document.getElementById('calendar');
    const formContainer = document.getElementById('event-form-container');
    let activeEvent = null;
  
    const calendar = new FullCalendar.Calendar(calendarEl, {
      locale: 'de',
      initialView: 'dayGridMonth',
      height: 'auto',
      expandRows: true,
      headerToolbar: {
        left: 'today prev,next',
        center: 'title',
        right: 'dayGridMonth timeGridWeek timeGridDay'
      },
      buttonText: {
        today: 'Heute',
        month: 'Monat',
        week: 'Woche',
        day: 'Tagesansicht'
      },
      navLinks: true,
      selectable: true,
      editable: true,
      select: (selectInfo) => {
        activeEvent = null;
        showForm({
          title: '',
          start: selectInfo.startStr,
          end: selectInfo.endStr,
          allDay: selectInfo.allDay
        });
        calendar.unselect();
      },
      eventClick: (clickInfo) => {
        activeEvent = clickInfo.event;
        showForm({
          title: activeEvent.title,
          start: activeEvent.startStr || activeEvent.start,
          end: activeEvent.endStr || activeEvent.end,
          allDay: activeEvent.allDay
        });
      }
    });
  
    calendar.render();
  
    function showForm(data) {
      const deleteBtnHtml = activeEvent ? '<button type="button" id="delete-btn" class="delete">Löschen</button>' : '';
      formContainer.innerHTML = `
        <form id="event-form">
          <label>Titel:</label>
          <input type="text" id="evt-title" value="${data.title}" required />
          <label>Start:</label>
          <input type="datetime-local" id="evt-start" value="${toLocalDateTime(data.start)}" required />
          <label>Ende:</label>
          <input type="datetime-local" id="evt-end" value="${toLocalDateTime(data.end)}" required />
          <div class="buttons">
            <button type="button" id="cancel-btn">Abbrechen</button>
            ${deleteBtnHtml}
            <button type="submit" class="save">Speichern</button>
          </div>
        </form>
      `;
      formContainer.style.display = 'block';
  
      document.getElementById('cancel-btn').onclick = () => {
        formContainer.style.display = 'none';
      };
  
      if (activeEvent) {
        document.getElementById('delete-btn').onclick = () => {
          if (confirm('Termin wirklich löschen?')) {
            activeEvent.remove();
            formContainer.style.display = 'none';
          }
        };
      }
  
      document.getElementById('event-form').onsubmit = (e) => {
        e.preventDefault();
        const title = document.getElementById('evt-title').value;
        const start = document.getElementById('evt-start').value;
        const end = document.getElementById('evt-end').value;
        if (activeEvent) {
          activeEvent.setProp('title', title);
          activeEvent.setStart(start);
          activeEvent.setEnd(end);
        } else {
          calendar.addEvent({ title, start, end, allDay: false });
        }
        formContainer.style.display = 'none';
      };
    }
  
    function toLocalDateTime(dateStr) {
      const dt = new Date(dateStr);
      const pad = (n) => n.toString().padStart(2, '0');
      const y = dt.getFullYear();
      const m = pad(dt.getMonth()+1);
      const d = pad(dt.getDate());
      const hh = pad(dt.getHours());
      const mm = pad(dt.getMinutes());
      return `${y}-${m}-${d}T${hh}:${mm}`;
    }
  });