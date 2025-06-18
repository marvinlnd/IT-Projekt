// ============================
// Sprachauswahl für Krankenhistorie-Seite
// ============================

// Übersetzungen für die Krankenhistorie-Seite
const translations = {
  de: {
    'page.title': 'MediAssist – Krankenhistorie',
    'back.link': 'Zurück zur Übersicht',
    'header.title': '🩺 Krankenhistorie bearbeiten',
    'patient.name': 'Patient:',
    'context.edit': '🛠️ Bearbeiten',
    'context.delete': '🗑️ Löschen',
    'context.complete': '✅ Geheilt markieren',
    'modal.title': '🛠️ Erkrankung bearbeiten',
    'modal.label_disease': 'Krankheit:',
    'modal.label_date': 'Datum der Feststellung:',
    'modal.save': 'Fertig',
    'modal.cancel': 'Abbrechen',
    'form.title': '➕ Neue Erkrankung hinzufügen',
    'form.placeholder': 'Name der Krankheit',
    'form.add_button': 'Hinzufügen',
    'table.title': '📄 Krankenhistorie-Tabelle',
    'table.number': '#',
    'table.disease': 'Krankheit',
    'table.detection': 'Feststellung',
    'table.status': 'Status',
    'status.active': 'Aktiv',
    'status.healed': 'Geheilt',
    'nav.invoices': 'Rechnungen',
    'nav.logout': 'Ausloggen',
    'footer.datenschutz': 'Datenschutzerklärung',
    'footer.impressum': 'Impressum'
  },
  en: {
    'page.title': 'MediAssist – Medical History',
    'back.link': 'Back to Overview',
    'header.title': '🩺 Edit Medical History',
    'patient.name': 'Patient:',
    'context.edit': '🛠️ Edit',
    'context.delete': '🗑️ Delete',
    'context.complete': '✅ Mark as Healed',
    'modal.title': '🛠️ Edit Disease',
    'modal.label_disease': 'Disease:',
    'modal.label_date': 'Date of Detection:',
    'modal.save': 'Done',
    'modal.cancel': 'Cancel',
    'form.title': '➕ Add New Disease',
    'form.placeholder': 'Name of disease',
    'form.add_button': 'Add',
    'table.title': '📄 Medical History Table',
    'table.number': '#',
    'table.disease': 'Disease',
    'table.detection': 'Detection',
    'table.status': 'Status',
    'status.active': 'Active',
    'status.healed': 'Healed',
    'nav.invoices': 'Invoices',
    'nav.logout': 'Logout',
    'footer.datenschutz': 'Privacy Policy',
    'footer.impressum': 'Imprint'
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

    // Spezifische Krankenhistorie-Elemente übersetzen
    this.translateMedicalHistoryElements(currentTranslations);
    
    // Navigation übersetzen
    this.translateNavigation(currentTranslations);
  }

  translateMedicalHistoryElements(translations) {
    // Zurück-Link
    const backLink = document.querySelector('.back-link');
    if (backLink) {
      backLink.innerHTML = `&larr; ${translations['back.link']}`;
    }

    // Hauptüberschrift
    const mainTitle = document.querySelector('h1');
    if (mainTitle) {
      mainTitle.textContent = translations['header.title'];
    }

    // Patient Name Label (nur das "Patient:" Teil)
    const patientNameElement = document.getElementById('patient-name');
    if (patientNameElement) {
      const currentText = patientNameElement.textContent;
      const patientName = currentText.replace(/^Patient:\s*/, '').replace(/^Patient:\s*/, '');
      patientNameElement.textContent = `${translations['patient.name']} ${patientName}`;
    }

    // Kontextmenü Buttons
    const contextButtons = [
      { id: 'edit-button', key: 'context.edit' },
      { id: 'delete-button', key: 'context.delete' },
      { id: 'complete-button', key: 'context.complete' }
    ];

    contextButtons.forEach(({ id, key }) => {
      const button = document.getElementById(id);
      if (button && translations[key]) {
        button.textContent = translations[key];
      }
    });

    // Modal Elemente
    const modalTitle = document.querySelector('.modal h2');
    if (modalTitle) {
      modalTitle.textContent = translations['modal.title'];
    }

    const modalLabels = document.querySelectorAll('.modal label');
    modalLabels.forEach((label, index) => {
      if (index === 0) {
        label.textContent = translations['modal.label_disease'];
      } else if (index === 1) {
        label.textContent = translations['modal.label_date'];
      }
    });

    const modalSave = document.getElementById('modal-save');
    if (modalSave) {
      modalSave.textContent = translations['modal.save'];
    }

    const modalCancel = document.getElementById('modal-cancel');
    if (modalCancel) {
      modalCancel.textContent = translations['modal.cancel'];
    }

    // Formular-Sektion
    const formTitle = document.querySelector('.form-section h2');
    if (formTitle) {
      formTitle.textContent = translations['form.title'];
    }

    const diseaseInput = document.getElementById('nameDerKrankheit');
    if (diseaseInput) {
      diseaseInput.placeholder = translations['form.placeholder'];
    }

    const addButton = document.getElementById('add-history');
    if (addButton) {
      addButton.textContent = translations['form.add_button'];
    }

    // Tabellen-Sektion
    const tableTitle = document.querySelector('.tabelle-section h2');
    if (tableTitle) {
      tableTitle.textContent = translations['table.title'];
    }

    // Tabellen-Header
    const tableHeaders = document.querySelectorAll('#krankenhistorieTabelle th');
    const headerKeys = ['table.number', 'table.disease', 'table.detection', 'table.status'];
    tableHeaders.forEach((th, index) => {
      if (headerKeys[index] && translations[headerKeys[index]]) {
        th.textContent = translations[headerKeys[index]];
      }
    });

    // Status-Texte in der Tabelle übersetzen
    document.querySelectorAll('#krankenhistorieTabelle tbody tr').forEach(row => {
      const statusCell = row.cells[3]; // Status ist die 4. Spalte (Index 3)
      if (statusCell) {
        const statusText = statusCell.textContent.trim();
        if (statusText === 'Aktiv' || statusText === 'Active') {
          statusCell.textContent = translations['status.active'];
        } else if (statusText === 'Geheilt' || statusText === 'Healed') {
          statusCell.textContent = translations['status.healed'];
        }
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

    // Footer Links übersetzen (falls vorhanden)
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

  // Funktion für krankenhistorie.js um neue Tabellenzeilen zu übersetzen
  translateTableRow(row) {
    const currentTranslations = translations[this.currentLanguage];
    const statusCell = row.cells[3];
    if (statusCell) {
      const statusText = statusCell.textContent.trim();
      if (statusText === 'Aktiv' || statusText === 'Active') {
        statusCell.textContent = currentTranslations['status.active'];
      } else if (statusText === 'Geheilt' || statusText === 'Healed') {
        statusCell.textContent = currentTranslations['status.healed'];
      }
    }
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

window.translateTableRow = function(row) {
  return languageSwitcher ? languageSwitcher.translateTableRow(row) : null;
};
