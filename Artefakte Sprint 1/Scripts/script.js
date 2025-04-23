// 1) Logo: zurück zur Startseite
document.querySelector('.logo').addEventListener('click', e => {
    e.preventDefault();
    window.location.href = 'index.html';
  });
  
  // 2) Suche: Enter oder Klick auf Button → Filter der Cards
  const searchInput = document.getElementById('search-input');
  const searchButton = document.getElementById('search-button');
  function doFilter() {
    const term = searchInput.value.trim().toLowerCase();
    document.querySelectorAll('.card').forEach(card => {
      const name = card.dataset.name.toLowerCase();
      card.style.display = name.includes(term) ? '' : 'none';
    });
  }
  searchInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') doFilter();
  });
  searchButton.addEventListener('click', doFilter);
  
  // 3) Sprachwechsel
  const texts = {
    de: {
      'nav.datenschutz': 'Datenschutz & Sicherheit',
      'nav.funktionen': 'Funktionen',
      'nav.sprache': 'Sprachauswahl',
      'nav.kontakt': 'Kontakt',
      'nav.profil': 'Benutzprofil',
      'card.patienten': 'Patientenübersicht',
      'card.termine': 'Terminübersicht',
      'card.notizen': 'Notizbereich',
      'card.zeit': 'Zeiterfassung',
      'footer.patienten': 'Patientenübersicht',
      'footer.termine': 'Terminübersicht',
      'footer.zeit': 'Zeiterfassung',
      'placeholder.search': 'Suche…'
    },
    en: {
      'nav.datenschutz': 'Privacy & Security',
      'nav.funktionen': 'Features',
      'nav.sprache': 'Language',
      'nav.kontakt': 'Contact',
      'nav.profil': 'Profile',
      'card.patienten': 'Patients',
      'card.termine': 'Appointments',
      'card.notizen': 'Notes',
      'card.zeit': 'Time tracking',
      'footer.patienten': 'Patients',
      'footer.termine': 'Appointments',
      'footer.zeit': 'Time tracking',
      'placeholder.search': 'Search…'
    }
  };
  let currentLang = 'de';
  document.getElementById('lang-icon').addEventListener('click', () => {
    const choice = prompt('Sprache wählen: "de" oder "en"', currentLang);
    if (!choice || !texts[choice]) return;
    currentLang = choice;
    // alle Elemente mit data-key updaten
    document.querySelectorAll('[data-key]').forEach(el => {
      const key = el.getAttribute('data-key');
      if (el.tagName === 'INPUT') {
        el.placeholder = texts[currentLang][key] || el.placeholder;
      } else {
        el.textContent = texts[currentLang][key] || el.textContent;
      }
    });
    // Suchplatzhalter
    searchInput.placeholder = texts[currentLang]['placeholder.search'];
  });
  
  // 4) Login / Registrierung
  document.getElementById('login-icon').addEventListener('click', () => {
    const isLogin = confirm('Bestehender Benutzer? OK = Login, Abbrechen = Registrierung');
    if (isLogin) {
      // hier könntest Du tatsächlich ein Login-Formular anzeigen oder umleiten:
      window.location.href = 'login.html';
    } else {
      window.location.href = 'register.html';
    }
  });
  