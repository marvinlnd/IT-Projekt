let calendar; // Globaler Kalender
let currentLang = 'de';

const TEXTS = {
  de: {
    'view.month': 'Monat',
    'view.week': 'Woche',
    'view.day': 'Tag',
    'button.today': 'Heute',
    'form.cancel': 'Abbrechen',
    'form.delete': 'Löschen',
    'form.save': 'Speichern',
    'form.title': 'Titel:',
    'form.start': 'Start:',
    'form.end': 'Ende:',
    'header.title': 'Termine'
  },
  en: {
    'view.month': 'Month',
    'view.week': 'Week',
    'view.day': 'Day',
    'button.today': 'Today',
    'form.cancel': 'Cancel',
    'form.delete': 'Delete',
    'form.save': 'Save',
    'form.title': 'Title:',
    'form.start': 'Start:',
    'form.end': 'End:',
    'header.title': 'Appointments'
  }
};

async function initCalendar(locale = 'de') {
  const calendarEl = document.getElementById('calendar');

  if (calendar) {
    calendar.destroy();
  }

  calendar = new FullCalendar.Calendar(calendarEl, {
    locale: locale,
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'today prev,next',
      center: 'title',
      right: 'dayGridMonth timeGridWeek timeGridDay'
    },
    buttonText: {
      today: TEXTS[locale]['button.today'],
      month: TEXTS[locale]['view.month'],
      week: TEXTS[locale]['view.week'],
      day: TEXTS[locale]['view.day']
    },
    selectable: true,
    editable: true,
    // Hier deine Callback-Funktionen einfügen
    select: () => {},
    dateClick: () => {},
    eventClick: () => {}
  });

  calendar.render();
}

function updateStaticText() {
  const t = TEXTS[currentLang];
  if (!t) return;

  const staticElements = [
    { selector: '.kalender-header h2', key: 'header.title' },
    { selector: '#view-dropdown li[data-view="dayGridMonth"]', key: 'view.month' },
    { selector: '#view-dropdown li[data-view="timeGridWeek"]', key: 'view.week' },
    { selector: '#view-dropdown li[data-view="timeGridDay"]', key: 'view.day' },
    { selector: '#view-button', key: 'view.month' }
  ];

  staticElements.forEach(({selector, key}) => {
    const el = document.querySelector(selector);
    if (el && t[key]) {
      if (selector === '#view-button') {
        el.textContent = t[key] + ' ▾';
      } else {
        el.textContent = t[key];
      }
    }
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  const langButton = document.getElementById('lang-button');
  const langDropdown = document.getElementById('lang-dropdown');

  await initCalendar(currentLang);
  updateStaticText();

  langButton.addEventListener('click', () => {
    const open = langDropdown.classList.toggle('open');
    langButton.setAttribute('aria-expanded', open);
  });

  document.addEventListener('click', e => {
    if (!langButton.contains(e.target) && !langDropdown.contains(e.target)) {
      langDropdown.classList.remove('open');
      langButton.setAttribute('aria-expanded', 'false');
    }
  });

  langDropdown.querySelectorAll('li').forEach(item => {
    item.addEventListener('click', async () => {
      const lang = item.dataset.lang;
      if (lang !== currentLang) {
        currentLang = lang;
        langButton.innerHTML = lang.toUpperCase() + ' <span class="arrow">▾</span>';
        langDropdown.classList.remove('open');
        langButton.setAttribute('aria-expanded', 'false');

        await initCalendar(currentLang);
        updateStaticText();
      }
    });
  });
});
