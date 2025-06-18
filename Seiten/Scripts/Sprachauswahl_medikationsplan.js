// ============================
// Sprachauswahl für Medikationsplan-Seite
// ============================

// Übersetzungen für die Medikationsplan-Seite
const translations = {
  de: {
    'page.title': 'MediAssist – Medikationsplan',
    'back.link': 'Zurück zur Patientenliste',
    'header.title': '💊 Medikationsplan verwalten',
    'patient.name': 'Patient:',
    'context.edit': '🛠️ Bearbeiten',
    'context.delete': '🗑️ Löschen',
    'modal.title': '🛠️ Medikation bearbeiten',
    'modal.medication': 'medikament:',
    'modal.amount': 'anzahl:',
    'modal.weekdays': 'Wochentage (z.B. Mo, Mi):',
    'modal.save': 'Fertig',
    'modal.cancel': 'Abbrechen',
    'form.add_title': '➕ Neue Medikation hinzufügen',
    'form.medication_placeholder': 'Medikamentenname',
    'form.dose_placeholder': 'Dosis',
    'form.weekdays_placeholder': 'Wochentage (z. B. Mo, Mi)',
    'form.add_button': 'Hinzufügen',
    'form.edit_title': '🛠️ Medikation bearbeiten',
    'form.select_index': 'Index auswählen:',
    'form.new_medication': 'Neuer Medikamentenname',
    'form.new_amount': 'Neue Anzahl',
    'form.new_weekdays': 'Neue Wochentage',
    'form.save_changes': 'Änderungen speichern',
    'form.delete_title': '🗑️ Medikation löschen',
    'form.delete_button': 'Löschen',
    'form.clear_all': '🧹 Alles löschen',
    'table.title': '📄 Medikationsplan',
    'table.number': '#',
    'table.medication': 'Medikament',
    'table.amount': 'Anzahl',
    'table.dose': 'Dosis',
    'table.time': 'Tageszeit',
    'table.weekdays': 'Wochentage',
    'unit.tablets': 'Tabletten',
    'unit.ml': 'ml',
    'unit.drops': 'Tropfen',
    'unit.capsules': 'Kapseln',
    'unit.mg': 'mg',
    'unit.ie': 'IE',
    'time.morning': 'morgens',
    'time.noon': 'mittags',
    'time.afternoon': 'nachmittags',
    'time.evening': 'abends',
    'nav.invoices': 'Rechnungen',
    'nav.logout': 'Ausloggen',
    'footer.datenschutz': 'Datenschutzerklärung',
    'footer.impressum': 'Impressum'
  },
  en: {
    'page.title': 'MediAssist – Medication Plan',
    'back.link': 'Back to Patient List',
    'header.title': '💊 Manage Medication Plan',
    'patient.name': 'Patient:',
    'context.edit': '🛠️ Edit',
    'context.delete': '🗑️ Delete',
    'modal.title': '🛠️ Edit Medication',
    'modal.medication': 'medication:',
    'modal.amount': 'amount:',
    'modal.weekdays': 'Weekdays (e.g. Mon, Wed):',
    'modal.save': 'Done',
    'modal.cancel': 'Cancel',
    'form.add_title': '➕ Add New Medication',
    'form.medication_placeholder': 'Medication name',
    'form.dose_placeholder': 'Dose',
    'form.weekdays_placeholder': 'Weekdays (e.g. Mon, Wed)',
    'form.add_button': 'Add',
    'form.edit_title': '🛠️ Edit Medication',
    'form.select_index': 'Select index:',
    'form.new_medication': 'New medication name',
    'form.new_amount': 'New amount',
    'form.new_weekdays': 'New weekdays',
    'form.save_changes': 'Save changes',
    'form.delete_title': '🗑️ Delete Medication',
    'form.delete_button': 'Delete',
    'form.clear_all': '🧹 Clear all',
    'table.title': '📄 Medication Plan',
    'table.number': '#',
    'table.medication': 'Medication',
    'table.amount': 'Amount',
    'table.dose': 'Dose',
    'table.time': 'Time of day',
    'table.weekdays': 'Weekdays',
    'unit.tablets': 'Tablets',
    'unit.ml': 'ml',
    'unit.drops': 'Drops',
    'unit.capsules': 'Capsules',
    'unit.mg': 'mg',
    'unit.ie': 'IU',
    'time.morning': 'morning',
    'time.noon': 'noon',
    'time.afternoon': 'afternoon',
    'time.evening': 'evening',
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

    // Spezifische Medikationsplan-Elemente übersetzen
    this.translateMedicationElements(currentTranslations);
    
    // Navigation übersetzen
    this.translateNavigation(currentTranslations);
  }

  translateMedicationElements(translations) {
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

    // Patient Name Label
    const patientNameElement = document.getElementById('patient-name');
    if (patientNameElement) {
      const currentText = patientNameElement.textContent;
      const patientName = currentText.replace(/^Patient:\s*/, '');
      patientNameElement.textContent = `${translations['patient.name']} ${patientName}`;
    }

    // Kontextmenü Buttons
    const editButton = document.getElementById('edit-button');
    if (editButton) {
      editButton.textContent = translations['context.edit'];
    }

    const deleteButton = document.getElementById('delete-button');
    if (deleteButton) {
      deleteButton.textContent = translations['context.delete'];
    }

    // Modal Elemente
    const modalTitle = document.querySelector('.modal h2');
    if (modalTitle) {
      modalTitle.textContent = translations['modal.title'];
    }

    const modalLabels = document.querySelectorAll('.modal label');
    modalLabels.forEach((label, index) => {
      const forAttr = label.getAttribute('for');
      switch (forAttr) {
        case 'modal-medikament':
          label.textContent = translations['modal.medication'];
          break;
        case 'modal-anzahl':
          label.textContent = translations['modal.amount'];
          break;
        case 'modal-wochentage':
          label.textContent = translations['modal.weekdays'];
          break;
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

    // Formular-Titel
    const formTitles = document.querySelectorAll('.form-section h2');
    formTitles.forEach((title, index) => {
      switch (index) {
        case 0:
          title.textContent = translations['form.add_title'];
          break;
        case 1:
          title.textContent = translations['form.edit_title'];
          break;
        case 2:
          title.textContent = translations['form.delete_title'];
          break;
      }
    });

    // Input Placeholders
    const medicationInput = document.getElementById('medikament');
    if (medicationInput) {
      medicationInput.placeholder = translations['form.medication_placeholder'];
    }

    const doseInput = document.getElementById('anzahl');
    if (doseInput) {
      doseInput.placeholder = translations['form.dose_placeholder'];
    }

    const weekdaysInput = document.getElementById('wochentage');
    if (weekdaysInput) {
      weekdaysInput.placeholder = translations['form.weekdays_placeholder'];
    }

    const newMedicationInput = document.getElementById('neuesMedikament');
    if (newMedicationInput) {
      newMedicationInput.placeholder = translations['form.new_medication'];
    }

    const newAmountInput = document.getElementById('neueAnzahl');
    if (newAmountInput) {
      newAmountInput.placeholder = translations['form.new_amount'];
    }

    const newWeekdaysInput = document.getElementById('neueWochentage');
    if (newWeekdaysInput) {
      newWeekdaysInput.placeholder = translations['form.new_weekdays'];
    }

    // Labels für Dropdown-Auswahl
    const indexLabel = document.querySelector('label[for="indexDropdown"]');
    if (indexLabel) {
      indexLabel.textContent = translations['form.select_index'];
    }

    const deleteIndexLabel = document.querySelector('label[for="indexLoeschenDropdown"]');
    if (deleteIndexLabel) {
      deleteIndexLabel.textContent = translations['form.select_index'];
    }

    // Buttons
    const addButton = document.getElementById('add-med');
    if (addButton) {
      addButton.textContent = translations['form.add_button'];
    }

    const editMedButton = document.getElementById('edit-med');
    if (editMedButton) {
      editMedButton.textContent = translations['form.save_changes'];
    }

    const deleteMedButton = document.getElementById('delete-med');
    if (deleteMedButton) {
      deleteMedButton.textContent = translations['form.delete_button'];
    }

    const clearButton = document.getElementById('clear-med');
    if (clearButton) {
      clearButton.textContent = translations['form.clear_all'];
    }

    // Select-Optionen für Einheiten
    this.translateSelectOptions();

    // Tabellen-Sektion
    const tableTitle = document.querySelector('.tabelle-section h2');
    if (tableTitle) {
      tableTitle.textContent = translations['table.title'];
    }

    // Tabellen-Header
    const tableHeaders = document.querySelectorAll('#medikationsTabelle th');
    const headerKeys = ['table.number', 'table.medication', 'table.amount', 'table.dose', 'table.time', 'table.weekdays'];
    tableHeaders.forEach((th, index) => {
      if (headerKeys[index] && translations[headerKeys[index]]) {
        th.textContent = translations[headerKeys[index]];
      }
    });
  }

  translateSelectOptions() {
    const currentTranslations = translations[this.currentLanguage];
    
    // Alle Einheiten-Selects übersetzen
    const unitSelects = document.querySelectorAll('select[id*="einheit"], select[id*="Einheit"]');
    unitSelects.forEach(select => {
      const options = select.querySelectorAll('option');
      options.forEach(option => {
        switch (option.value) {
          case 'Tabletten':
            option.textContent = currentTranslations['unit.tablets'];
            break;
          case 'ml':
            option.textContent = currentTranslations['unit.ml'];
            break;
          case 'Tropfen':
            option.textContent = currentTranslations['unit.drops'];
            break;
          case 'Kapseln':
            option.textContent = currentTranslations['unit.capsules'];
            break;
          case 'g':
            option.textContent = currentTranslations['unit.mg'];
            break;
          case 'IE':
            option.textContent = currentTranslations['unit.ie'];
            break;
        }
      });
    });

    // Alle Tageszeit-Selects übersetzen
    const timeSelects = document.querySelectorAll('select[id*="tageszeit"], select[id*="Tageszeit"]');
    timeSelects.forEach(select => {
      const options = select.querySelectorAll('option');
      options.forEach(option => {
        switch (option.value) {
          case 'morgens':
            option.textContent = currentTranslations['time.morning'];
            break;
          case 'mittags':
            option.textContent = currentTranslations['time.noon'];
            break;
          case 'nachmittags':
            option.textContent = currentTranslations['time.afternoon'];
            break;
          case 'abends':
            option.textContent = currentTranslations['time.evening'];
            break;
        }
      });
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

  // Funktion zum Übersetzen neuer Tabellenzeilen
  translateTableRow(row) {
    const currentTranslations = translations[this.currentLanguage];
    
    // Einheiten in der Tabelle übersetzen
    const doseCell = row.cells[3]; // Dosis-Spalte
    if (doseCell) {
      let content = doseCell.textContent;
      // Einheiten übersetzen
      content = content.replace(/Tabletten/g, currentTranslations['unit.tablets']);
      content = content.replace(/Tropfen/g, currentTranslations['unit.drops']);
      content = content.replace(/Kapseln/g, currentTranslations['unit.capsules']);
      doseCell.textContent = content;
    }

    // Tageszeiten in der Tabelle übersetzen
    const timeCell = row.cells[4]; // Tageszeit-Spalte
    if (timeCell) {
      let content = timeCell.textContent;
      content = content.replace(/morgens/g, currentTranslations['time.morning']);
      content = content.replace(/mittags/g, currentTranslations['time.noon']);
      content = content.replace(/nachmittags/g, currentTranslations['time.afternoon']);
      content = content.replace(/abends/g, currentTranslations['time.evening']);
      timeCell.textContent = content;
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
