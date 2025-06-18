/**
 * MediAssist Language Switcher
 * Sprachauswahl-Funktionalität für die Dokumente-Seite
 */

(function() {
  'use strict';
  
  // Verhindere mehrfache Initialisierung
  if (window.MediAssistLanguageSwitcher) {
    console.warn('Language Switcher bereits initialisiert');
    return;
  }

  // Übersetzungen definieren
  const translations = {
    de: {
      // Seitentitel und Hauptelemente
      pageTitle: "MediAssist – Dokumente",
      pageHeader: "Dokumente",
      uploadButton: "Dokument hochladen",
      
      // Tabellen-Header
      tableHeaderFilename: "Dateiname",
      tableHeaderActions: "Aktionen",
      
      // Modal und Buttons
      closeButton: "✖️ Schließen",
      replaceAction: "Ersetzen",
      deleteAction: "Löschen",
      
      // Header-Navigation
      accountTitle: "Konto",
      bills: "Rechnungen",
      logout: "Ausloggen",
      
      // Alerts und Bestätigungen
      selectFileAlert: "Bitte eine Datei auswählen.",
      deleteConfirmTemplate: 'Datei "{fileName}" wirklich löschen?',
      
      // Console-Nachrichten
      firebaseInitialized: "✅ Firebase initialisiert!",
      documentsLoaded: "✅ Dateien aus Firestore geladen.",
      fileReplaced: "✅ Datei ersetzt.",
      fileDeleted: "✅ Datei gelöscht.",
      fileSaved: "✅ Datei in Firestore gespeichert.",
      loadError: "Fehler beim Laden der Dokumente:",
      replaceError: "Fehler beim Ersetzen:",
      deleteError: "Fehler beim Löschen:",
      uploadError: "Fehler beim Hochladen:"
    },
    en: {
      // Seitentitel und Hauptelemente
      pageTitle: "MediAssist – Documents",
      pageHeader: "Documents",
      uploadButton: "Upload Document",
      
      // Tabellen-Header
      tableHeaderFilename: "Filename",
      tableHeaderActions: "Actions",
      
      // Modal und Buttons
      closeButton: "✖️ Close",
      replaceAction: "Replace",
      deleteAction: "Delete",
      
      // Header-Navigation
      accountTitle: "Account",
      bills: "Bills",
      logout: "Logout",
      
      // Alerts und Bestätigungen
      selectFileAlert: "Please select a file.",
      deleteConfirmTemplate: 'Really delete file "{fileName}"?',
      
      // Console-Nachrichten
      firebaseInitialized: "✅ Firebase initialized!",
      documentsLoaded: "✅ Files loaded from Firestore.",
      fileReplaced: "✅ File replaced.",
      fileDeleted: "✅ File deleted.",
      fileSaved: "✅ File saved to Firestore.",
      loadError: "Error loading documents:",
      replaceError: "Error replacing:",
      deleteError: "Error deleting:",
      uploadError: "Error uploading:"
    }
  };

  // Klasse für Language Switcher
  class LanguageSwitcher {
    constructor() {
      this.currentLanguage = 'de'; // Standard: Deutsch
      this.elements = {};
      this.tableObserver = null;
      
      this.init();
    }

    // Initialisierung
    init() {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.setup());
      } else {
        this.setup();
      }
    }

    // Setup nach DOM-Load
    setup() {
      this.findElements();
      this.setupEventListeners();
      this.loadSavedLanguage();
      this.setupTableObserver();
      
      console.log('🌐 Language Switcher initialisiert');
    }

    // DOM-Elemente finden
    findElements() {
      this.elements = {
        langButton: document.getElementById('lang-button'),
        langDropdown: document.getElementById('lang-dropdown'),
        userLoginIcon: document.getElementById('login-icon'),
        pageTitle: document.querySelector('title'),
        pageHeader: document.querySelector('.dokumente-list h2'),
        uploadButton: document.querySelector('.upload-form .btn.add'),
        tableHeaders: document.querySelectorAll('#documents-table thead th'),
        closeButton: document.getElementById('close-preview-btn'),
        tableBody: document.querySelector('#documents-table tbody')
      };
    }

    // Event-Listener einrichten
    setupEventListeners() {
      const { langButton, langDropdown } = this.elements;
      
      if (!langButton || !langDropdown) {
        console.warn('Sprachauswahl-Elemente nicht gefunden');
        return;
      }

      // Dropdown Toggle
      langButton.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleDropdown();
      });

      // Sprachauswahl
      const langItems = langDropdown.querySelectorAll('li[data-lang]');
      langItems.forEach(item => {
        item.addEventListener('click', (e) => {
          const selectedLang = e.target.getAttribute('data-lang');
          this.changeLanguage(selectedLang);
          this.closeDropdown();
        });

        // Keyboard Navigation
        item.addEventListener('keydown', (e) => {
          this.handleKeyboardNavigation(e, langItems, item);
        });
      });

      // Dropdown schließen bei Klick außerhalb
      document.addEventListener('click', (e) => {
        if (!langButton.contains(e.target) && !langDropdown.contains(e.target)) {
          this.closeDropdown();
        }
      });

      // ESC-Taste
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this.closeDropdown();
        }
      });
    }

    // Dropdown öffnen/schließen
    toggleDropdown() {
      const isExpanded = this.elements.langButton.getAttribute('aria-expanded') === 'true';
      
      if (isExpanded) {
        this.closeDropdown();
      } else {
        this.openDropdown();
      }
    }

    openDropdown() {
      const { langButton, langDropdown } = this.elements;
      
      langButton.setAttribute('aria-expanded', 'true');
      langDropdown.style.display = 'block';
      langDropdown.setAttribute('aria-hidden', 'false');
      
      // Fokus auf erstes Element
      const firstItem = langDropdown.querySelector('li[data-lang]');
      if (firstItem) {
        firstItem.focus();
      }
    }

    closeDropdown() {
      const { langButton, langDropdown } = this.elements;
      
      langButton.setAttribute('aria-expanded', 'false');
      langDropdown.style.display = 'none';
      langDropdown.setAttribute('aria-hidden', 'true');
    }

    // Keyboard Navigation
    handleKeyboardNavigation(e, langItems, currentItem) {
      const currentIndex = Array.from(langItems).indexOf(currentItem);
      let nextIndex;

      switch(e.key) {
        case 'Enter':
        case ' ':
          e.preventDefault();
          const selectedLang = currentItem.getAttribute('data-lang');
          this.changeLanguage(selectedLang);
          this.closeDropdown();
          break;

        case 'ArrowDown':
          e.preventDefault();
          nextIndex = (currentIndex + 1) % langItems.length;
          langItems[nextIndex].focus();
          break;

        case 'ArrowUp':
          e.preventDefault();
          nextIndex = (currentIndex - 1 + langItems.length) % langItems.length;
          langItems[nextIndex].focus();
          break;

        case 'Home':
          e.preventDefault();
          langItems[0].focus();
          break;

        case 'End':
          e.preventDefault();
          langItems[langItems.length - 1].focus();
          break;
      }
    }

    // Sprache ändern
    changeLanguage(lang) {
      if (lang === this.currentLanguage || !translations[lang]) {
        return;
      }
      
      this.currentLanguage = lang;
      this.updatePageContent(lang);
      this.updateLanguageButton(lang);
      this.saveLanguagePreference(lang);
      
      // Event für andere Skripte
      document.dispatchEvent(new CustomEvent('languageChanged', { 
        detail: { 
          language: lang, 
          translations: translations[lang],
          switcher: this
        } 
      }));
      
      console.log(`🌐 Sprache geändert zu: ${lang.toUpperCase()}`);
    }

    // Seiteninhalt aktualisieren
    updatePageContent(lang) {
      const t = translations[lang];
      const { elements } = this;
      
      // Seitentitel
      if (elements.pageTitle) {
        elements.pageTitle.textContent = t.pageTitle;
      }
      
      // Hauptüberschrift
      if (elements.pageHeader) {
        elements.pageHeader.textContent = t.pageHeader;
      }
      
      // Upload-Button
      if (elements.uploadButton) {
        elements.uploadButton.textContent = t.uploadButton;
      }
      
      // Tabellen-Header
      if (elements.tableHeaders.length >= 2) {
        elements.tableHeaders[0].textContent = t.tableHeaderFilename;
        elements.tableHeaders[1].textContent = t.tableHeaderActions;
      }
      
      // Modal Schließen-Button
      if (elements.closeButton) {
        elements.closeButton.textContent = t.closeButton;
      }
      
      // Header-Elemente
      if (elements.userLoginIcon) {
        elements.userLoginIcon.setAttribute('title', t.accountTitle);
      }
      
      // Navigation-Links
      this.updateNavigationLinks(t);
      
      // Tabellen-Buttons
      this.updateTableActionButtons(t);
    }

    // Navigation-Links aktualisieren
    updateNavigationLinks(translations) {
      const billsLink = document.querySelector('.login-menu a[href*="rechnung"]');
      if (billsLink) {
        billsLink.textContent = translations.bills;
      }
      
      const logoutLink = document.querySelector('.login-menu a[href*="Login_Registrieren"]');
      if (logoutLink) {
        logoutLink.textContent = translations.logout;
      }
    }

    // Tabellen-Aktions-Buttons aktualisieren
    updateTableActionButtons(translations) {
      // Ersetzen-Buttons
      const replaceButtons = document.querySelectorAll('.btn.replace');
      replaceButtons.forEach(btn => {
        btn.textContent = translations.replaceAction;
        btn.setAttribute('title', translations.replaceAction);
      });
      
      // Löschen-Buttons
      const deleteButtons = document.querySelectorAll('.btn.delete');
      deleteButtons.forEach(btn => {
        btn.textContent = translations.deleteAction;
        btn.setAttribute('title', translations.deleteAction);
      });
    }

    // Sprach-Button aktualisieren
    updateLanguageButton(lang) {
      if (this.elements.langButton) {
        this.elements.langButton.innerHTML = `${lang.toUpperCase()} <span class="arrow">▾</span>`;
      }
    }

    // Spracheinstellung speichern
    saveLanguagePreference(lang) {
      try {
        localStorage.setItem('mediassist_language', lang);
      } catch (e) {
        console.warn('LocalStorage nicht verfügbar');
      }
    }

    // Gespeicherte Sprache laden
    loadSavedLanguage() {
      try {
        const savedLang = localStorage.getItem('mediassist_language');
        if (savedLang && translations[savedLang]) {
          this.changeLanguage(savedLang);
        }
      } catch (e) {
        console.warn('LocalStorage nicht verfügbar');
      }
    }

    // Table Observer für dynamisch hinzugefügte Elemente
    setupTableObserver() {
      if (!this.elements.tableBody) return;

      this.tableObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            // Kleine Verzögerung für DOM-Updates
            setTimeout(() => {
              this.updateTableActionButtons(translations[this.currentLanguage]);
            }, 10);
          }
        });
      });

      this.tableObserver.observe(this.elements.tableBody, { 
        childList: true, 
        subtree: true 
      });
    }

    // Hilfsfunktionen für externe Nutzung
    getTranslation(key, params = {}) {
      const translation = translations[this.currentLanguage]?.[key] || key;
      
      // Template-Parameter ersetzen (z.B. {fileName})
      return Object.keys(params).reduce((str, param) => {
        return str.replace(new RegExp(`\\{${param}\\}`, 'g'), params[param]);
      }, translation);
    }

    getCurrentLanguage() {
      return this.currentLanguage;
    }

    getSelectFileAlert() {
      return this.getTranslation('selectFileAlert');
    }

    getDeleteConfirm(fileName) {
      return this.getTranslation('deleteConfirmTemplate', { fileName });
    }

    getConsoleMessage(key) {
      return this.getTranslation(key);
    }

    // Cleanup
    destroy() {
      if (this.tableObserver) {
        this.tableObserver.disconnect();
      }
    }
  }

  // Globale Instanz erstellen
  const languageSwitcher = new LanguageSwitcher();

  // Globale API für externe Nutzung
  window.MediAssistLanguageSwitcher = {
    instance: languageSwitcher,
    changeLanguage: (lang) => languageSwitcher.changeLanguage(lang),
    getCurrentLanguage: () => languageSwitcher.getCurrentLanguage(),
    getTranslation: (key, params) => languageSwitcher.getTranslation(key, params),
    getSelectFileAlert: () => languageSwitcher.getSelectFileAlert(),
    getDeleteConfirm: (fileName) => languageSwitcher.getDeleteConfirm(fileName),
    getConsoleMessage: (key) => languageSwitcher.getConsoleMessage(key),
    translations: translations,
    updateTableActionButtons: () => languageSwitcher.updateTableActionButtons(translations[languageSwitcher.currentLanguage])
  };

})();
