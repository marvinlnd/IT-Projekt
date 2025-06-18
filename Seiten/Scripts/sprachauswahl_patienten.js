// ============================
// Sprachauswahl für Patientenseite
// ============================

// Übersetzungen für die Patientenseite
const translations = {
  de: {
    'page.title': 'MediAssist – Patientenliste',
    'header.patients': 'Patienten',
    'search.placeholder': 'Patient suchen…',
    'search.label': 'Suche',
    'button.add_patient': 'Neuer Patient anlegen',
    'table.name': 'Name',
    'sort.az': 'Von A bis Z',
    'sort.za': 'Von Z bis A',
    'sort.newest': 'Neueste zuerst',
    'sort.oldest': 'Älteste zuerst',
    'modal.title': 'Patientenübersicht',
    'modal.personal_data': 'Persönliche Daten',
    'modal.protocol': 'Begleitprotokoll',
    'modal.history': 'Krankenhistorie',
    'modal.medication': 'Medikationsplan',
    'modal.doctor': 'Ärzte',
    'modal.documents': 'Dokumente',
    'modal.delete': 'Patient löschen',
    'footer.datenschutz': 'Datenschutzerklärung',
    'footer.impressum': 'Impressum',
    'nav.invoices': 'Rechnungen',
    'nav.logout': 'Ausloggen'
  },
  en: {
    'page.title': 'MediAssist – Patient List',
    'header.patients': 'Patients',
    'search.placeholder': 'Search patient…',
    'search.label': 'Search',
    'button.add_patient': 'Add New Patient',
    'table.name': 'Name',
    'sort.az': 'From A to Z',
    'sort.za': 'From Z to A',
    'sort.newest': 'Newest first',
    'sort.oldest': 'Oldest first',
    'modal.title': 'Patient Overview',
    'modal.personal_data': 'Personal Data',
    'modal.protocol': 'Care Protocol',
    'modal.history': 'Medical History',
    'modal.medication': 'Medication Plan',
    'modal.doctor': 'Doctors',
    'modal.documents': 'Documents',
    'modal.delete': 'Delete Patient',
    'footer.datenschutz': 'Privacy Policy',
    'footer.impressum': 'Imprint',
    'nav.invoices': 'Invoices',
    'nav.logout': 'Logout'
  }
};

class LanguageSwitcher {
  constructor() {
    this.currentLanguage = localStorage.getItem('selectedLanguage') || 'de';
    this.langButton = document.getElementById('lang-button');
    this.langDropdown = document.getElementById('lang-dropdown');
    
    this.init();
  }

  init() {
    if (!this.langButton || !this.langDropdown) {
      console.warn('Sprachauswahl-Elemente nicht gefunden');
      return;
    }

    this.setupEventListeners();
    this.updateButtonText();
    this.applyTranslations();
  }

  setupEventListeners() {
    // Button Click - Dropdown öffnen/schließen
    this.langButton.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleDropdown();
    });

    // Sprachauswahl
    this.langDropdown.addEventListener('click', (e) => {
      e.stopPropagation();
      const langItem = e.target.closest('[data-lang]');
      if (langItem) {
        const selectedLang = langItem.getAttribute('data-lang');
        this.setLanguage(selectedLang);
        this.closeDropdown();
      }
    });

    // Klick außerhalb - Dropdown schließen
    document.addEventListener('click', () => {
      this.closeDropdown();
    });

    // Keyboard Navigation
    this.langButton.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.toggleDropdown();
      } else if (e.key === 'Escape') {
        this.closeDropdown();
      }
    });

    // Dropdown Keyboard Navigation
    this.langDropdown.addEventListener('keydown', (e) => {
      const items = this.langDropdown.querySelectorAll('[data-lang]');
      const currentIndex = Array.from(items).findIndex(item => 
        item === document.activeElement
      );

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          const nextIndex = (currentIndex + 1) % items.length;
          items[nextIndex].focus();
          break;
        case 'ArrowUp':
          e.preventDefault();
          const prevIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1;
          items[prevIndex].focus();
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (document.activeElement.hasAttribute('data-lang')) {
            const selectedLang = document.activeElement.getAttribute('data-lang');
            this.setLanguage(selectedLang);
            this.closeDropdown();
          }
          break;
        case 'Escape':
          e.preventDefault();
          this.closeDropdown();
          this.langButton.focus();
          break;
      }
    });
  }

  toggleDropdown() {
    const isOpen = this.langDropdown.classList.contains('open');
    if (isOpen) {
      this.closeDropdown();
    } else {
      this.openDropdown();
    }
  }

  openDropdown() {
    this.langDropdown.classList.add('open');
    this.langButton.setAttribute('aria-expanded', 'true');
    this.langDropdown.setAttribute('aria-hidden', 'false');
    
    // Ersten Eintrag fokussieren
    const firstItem = this.langDropdown.querySelector('[data-lang]');
    if (firstItem) {
      firstItem.focus();
    }
  }

  closeDropdown() {
    this.langDropdown.classList.remove('open');
    this.langButton.setAttribute('aria-expanded', 'false');
    this.langDropdown.setAttribute('aria-hidden', 'true');
  }

  setLanguage(lang) {
    if (!translations[lang]) {
      console.warn(`Sprache ${lang} nicht unterstützt`);
      return;
    }

    this.currentLanguage = lang;
    localStorage.setItem('selectedLanguage', lang);
    
    this.updateButtonText();
    this.applyTranslations();
    
    console.log(`Sprache geändert zu: ${lang}`);
  }

  updateButtonText() {
    this.langButton.innerHTML = `${this.currentLanguage.toUpperCase()} <span class="arrow">▾</span>`;
  }

  applyTranslations() {
    const currentTranslations = translations[this.currentLanguage];
    
    // Seiten-Titel ändern
    document.title = currentTranslations['page.title'];

    // Alle Elemente mit data-key übersetzen
    document.querySelectorAll('[data-key]').forEach(element => {
      const key = element.getAttribute('data-key');
      if (currentTranslations[key]) {
        element.textContent = currentTranslations[key];
      }
    });

    // Spezifische Patientenseiten-Elemente übersetzen
    this.translatePatientElements(currentTranslations);
    
    // Navigation übersetzen
    this.translateNavigation(currentTranslations);
  }

  translatePatientElements(translations) {
    // Hauptüberschrift
    const headerH2 = document.querySelector('.patienten-list h2');
    if (headerH2) {
      headerH2.textContent = translations['header.patients'];
    }

    // Suchfeld Placeholder
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.placeholder = translations['search.placeholder'];
    }

    // Such-Button aria-label
    const searchButton = document.getElementById('search-button');
    if (searchButton) {
      searchButton.setAttribute('aria-label', translations['search.label']);
    }

    // Neuer Patient Button
    const addButton = document.getElementById('add-button');
    if (addButton) {
      addButton.textContent = translations['button.add_patient'];
    }

    // Tabellen-Header
    const nameHeader = document.querySelector('.name-header span');
    if (nameHeader) {
      nameHeader.textContent = translations['table.name'];
    }

    // Sortier-Optionen im Dropdown
    const sortButtons = document.querySelectorAll('#filter-dropdown button');
    sortButtons.forEach(button => {
      const sortType = button.getAttribute('data-sort');
      switch (sortType) {
        case 'az':
          button.querySelector('span').textContent = translations['sort.az'];
          break;
        case 'za':
          button.querySelector('span').textContent = translations['sort.za'];
          break;
        case 'neueste':
          button.querySelector('span').textContent = translations['sort.newest'];
          break;
        case 'aelteste':
          button.querySelector('span').textContent = translations['sort.oldest'];
          break;
      }
    });

    // Modal Überschrift
    const modalName = document.getElementById('modal-name');
    if (modalName) {
      modalName.textContent = translations['modal.title'];
    }

    // Modal Buttons
    const modalButtons = [
      { id: 'btn-personal', key: 'modal.personal_data' },
      { id: 'btn-protokoll', key: 'modal.protocol' },
      { id: 'btn-history', key: 'modal.history' },
      { id: 'btn-medication', key: 'modal.medication' },
      { id: 'btn-doctor', key: 'modal.doctor' },
      { id: 'btn-document', key: 'modal.documents' },
      { id: 'btn-delete', key: 'modal.delete' }
    ];

    modalButtons.forEach(({ id, key }) => {
      const button = document.getElementById(id);
      if (button && translations[key]) {
        button.textContent = translations[key];
      }
    });
  }

  translateNavigation(translations) {
    // Login-Menu übersetzen
    const loginMenuLinks = document.querySelectorAll('#login-menu a');
    loginMenuLinks.forEach(link => {
      if (link.href.includes('rechnung.html')) {
        link.textContent = translations['nav.invoices'];
      } else if (link.href.includes('Login_Registrieren.html')) {
        link.textContent = translations['nav.logout'];
      }
    });

    // Footer Links übersetzen
    const footerLinks = document.querySelectorAll('footer a');
    footerLinks.forEach(link => {
      if (link.href.includes('Datenschutzerklärung')) {
        link.textContent = translations['footer.datenschutz'];
      } else if (link.href.includes('Impressum')) {
        link.textContent = translations['footer.impressum'];
      }
    });
  }

  // Globale Funktionen für andere Skripte
  getTranslation(key) {
    return translations[this.currentLanguage][key] || key;
  }

  getCurrentLanguage() {
    return this.currentLanguage;
  }
}

// Globale Instanz für andere Skripte
let languageSwitcher;

// Initialisierung
document.addEventListener('DOMContentLoaded', () => {
  languageSwitcher = new LanguageSwitcher();
});

// Export für andere JS-Dateien
window.getTranslation = function(key) {
  return languageSwitcher ? languageSwitcher.getTranslation(key) : key;
};

window.getCurrentLanguage = function() {
  return languageSwitcher ? languageSwitcher.getCurrentLanguage() : 'de';
};
