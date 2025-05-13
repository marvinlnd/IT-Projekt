// javascript/script.js
document.addEventListener('DOMContentLoaded', () => {
  // 1) Logo: zurück zur Startseite
  const logoLink = document.querySelector('.logo');
  logoLink?.addEventListener('click', e => {
    e.preventDefault();
    window.location.href = 'index.html';
  });

  // 2) Suche: nur falls vorhanden
  const searchInput  = document.getElementById('search-input');
  const searchButton = document.getElementById('search-button');
  if (searchInput && searchButton) {
    const doFilter = () => {
      const term = searchInput.value.trim().toLowerCase();
      document.querySelectorAll('.card').forEach(card => {
        const name = card.dataset.name.toLowerCase();
        card.style.display = name.includes(term) ? '' : 'none';
      });
    };
    searchInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') doFilter();
    });
    searchButton.addEventListener('click', doFilter);
  }

  // 3) Sprachwechsel
  const TEXTS = {
    de: {
      'card.patienten':    'Patienten',
      'card.termine':      'Termine',
      'card.notizen':      'Begleitprotokoll',
      'placeholder.search':'Suche…',
      'footer.termine':    'Datenschutzerklärung',
      'footer.zeit':       'Impressum'
    },
    en: {
      'card.patienten':    'Patients',
      'card.termine':      'Appointments',
      'card.notizen':      'Notes',
      'placeholder.search':'Search…',
      'footer.termine':    'Privacy & Security',
      'footer.zeit':       'Imprint'
    }
  };
  let currentLang = localStorage.getItem('lang') || 'de';

  const langButton   = document.getElementById('lang-button');
  const langDropdown = document.getElementById('lang-dropdown');
  const langItems    = Array.from(langDropdown.querySelectorAll('li'));

  const updateTexts = () => {
    document.querySelectorAll('[data-key]').forEach(el => {
      const key = el.getAttribute('data-key');
      const txt = TEXTS[currentLang][key];
      if (!txt) return;
      if (el.tagName === 'INPUT') el.placeholder = txt;
      else el.textContent = txt;
    });
    if (searchInput) {
      searchInput.placeholder = TEXTS[currentLang]['placeholder.search'];
    }
  };

  // Initialisierung
  langButton.textContent = currentLang.toUpperCase() + ' ▾';
  langButton.setAttribute('aria-expanded', 'false');
  updateTexts();

  // Dropdown öffnen/schließen
  langButton.addEventListener('click', () => {
    const open = langDropdown.classList.toggle('open');
    langButton.setAttribute('aria-expanded', open);
    if (open) langItems[0].focus();
  });

  // Klick außerhalb schließt Dropdown
  document.addEventListener('click', e => {
    if (!langButton.contains(e.target) && !langDropdown.contains(e.target)) {
      langDropdown.classList.remove('open');
      langButton.setAttribute('aria-expanded', 'false');
    }
  });

  // Esc-Taste schließt Dropdown
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && langDropdown.classList.contains('open')) {
      langDropdown.classList.remove('open');
      langButton.setAttribute('aria-expanded', 'false');
      langButton.focus();
    }
  });

  // ArrowDown öffnet Dropdown
  langButton.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!langDropdown.classList.contains('open')) {
        langDropdown.classList.add('open');
        langButton.setAttribute('aria-expanded', 'true');
      }
      langItems[0].focus();
    }
  });

  // Navigation & Auswahl
  langItems.forEach((item, idx) => {
    item.addEventListener('keydown', e => {
      let newIdx;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        newIdx = (idx + 1) % langItems.length;
        langItems[newIdx].focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        newIdx = (idx - 1 + langItems.length) % langItems.length;
        langItems[newIdx].focus();
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        item.click();
      }
    });
    item.addEventListener('click', () => {
      const chosen = item.dataset.lang;
      if (!TEXTS[chosen]) return;
      currentLang = chosen;
      localStorage.setItem('lang', chosen);
      langDropdown.classList.remove('open');
      langButton.setAttribute('aria-expanded', 'false');
      langButton.textContent = chosen.toUpperCase() + ' ▾';
      langButton.focus();
      updateTexts();
    });
  });

  // 4) Login / Registrierung
  const loginIcon = document.getElementById('login-icon');
  loginIcon?.addEventListener('click', () => {
    const isLogin = confirm('Bestehender Benutzer? OK = Login, Abbrechen = Registrierung');
    window.location.href = isLogin ? 'login.html' : 'register.html';
  });
});
