// Sprachauswahl-Funktionalität für die Persönliche Daten Seite
(function() {
  'use strict';

  // Übersetzungen definieren
  const translations = {
    de: {
      pageTitle: "MediAssist – Persönliche Daten",
      backLink: "← Zurück zur Patientenliste",
      pageHeader: "Persönliche Daten",
      vorname: "Vorname:",
      nachname: "Nachname:",
      email: "E-Mail:",
      telefon: "Telefon:",
      adresse: "Adresse:",
      geburtsdatum: "Geburtsdatum:",
      saveButton: "Speichern",
      cancelButton: "Abbrechen",
      // Header-Übersetzungen
      accountTitle: "Konto",
      bills: "Rechnungen",
      logout: "Ausloggen"
    },
    en: {
      pageTitle: "MediAssist – Personal Data",
      backLink: "← Back to Patient List",
      pageHeader: "Personal Data",
      vorname: "First Name:",
      nachname: "Last Name:",
      email: "Email:",
      telefon: "Phone:",
      adresse: "Address:",
      geburtsdatum: "Date of Birth:",
      saveButton: "Save",
      cancelButton: "Cancel",
      // Header-Übersetzungen
      accountTitle: "Account",
      bills: "Bills",
      logout: "Logout"
    }
  };

  // Aktuelle Sprache (standardmäßig Deutsch)
  let currentLanguage = 'de';

  // DOM-Elemente (lokal begrenzt)
  let langButton, langDropdown, userIcon;

  // Initialisierung
  document.addEventListener('DOMContentLoaded', function() {
    initializeDOMElements();
    initializeLanguageSwitcher();
    loadSavedLanguage();
  });

  // DOM-Elemente initialisieren
  function initializeDOMElements() {
    langButton = document.getElementById('lang-button');
    langDropdown = document.getElementById('lang-dropdown');
    userIcon = document.getElementById('login-icon');
  }

  // Sprachauswahl initialisieren
  function initializeLanguageSwitcher() {
    if (!langButton || !langDropdown) {
      console.warn('Sprachauswahl-Elemente nicht gefunden');
      return;
    }

    // Dropdown-Toggle für Sprache
    langButton.addEventListener('click', function(e) {
      e.stopPropagation();
      toggleLanguageDropdown();
    });

    // Sprachauswahl-Event-Listener
    const langItems = langDropdown.querySelectorAll('li[data-lang]');
    langItems.forEach(item => {
      item.addEventListener('click', function() {
        const selectedLang = this.getAttribute('data-lang');
        changeLanguage(selectedLang);
        closeLanguageDropdown();
      });

      // Keyboard navigation
      item.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const selectedLang = this.getAttribute('data-lang');
          changeLanguage(selectedLang);
          closeLanguageDropdown();
        }
      });
    });

    // Schließe Dropdown beim Klick außerhalb
    document.addEventListener('click', function(e) {
      if (!langButton.contains(e.target) && !langDropdown.contains(e.target)) {
        closeLanguageDropdown();
      }
    });

    // ESC-Taste zum Schließen
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        closeLanguageDropdown();
      }
    });

    // Keyboard Navigation setup
    setupKeyboardNavigation();
  }

  // Dropdown öffnen/schließen
  function toggleLanguageDropdown() {
    const isExpanded = langButton.getAttribute('aria-expanded') === 'true';
    
    if (isExpanded) {
      closeLanguageDropdown();
    } else {
      openLanguageDropdown();
    }
  }

  function openLanguageDropdown() {
    langButton.setAttribute('aria-expanded', 'true');
    langDropdown.style.display = 'block';
    langDropdown.setAttribute('aria-hidden', 'false');
    
    // Fokus auf erstes Element setzen
    const firstItem = langDropdown.querySelector('li[data-lang]');
    if (firstItem) {
      firstItem.focus();
    }
  }

  function closeLanguageDropdown() {
    langButton.setAttribute('aria-expanded', 'false');
    langDropdown.style.display = 'none';
    langDropdown.setAttribute('aria-hidden', 'true');
  }

  // Sprache ändern
  function changeLanguage(lang) {
    if (lang === currentLanguage) return;
    
    currentLanguage = lang;
    updatePageContent(lang);
    updateLanguageButton(lang);
    saveLanguagePreference(lang);
  }

  // Seiteninhalt aktualisieren
  function updatePageContent(lang) {
    const t = translations[lang];
    
    // Seitentitel
    document.title = t.pageTitle;
    
    // Zurück-Link
    const backLink = document.querySelector('.back-link');
    if (backLink) {
      backLink.textContent = t.backLink;
    }
    
    // Hauptüberschrift
    const mainHeader = document.querySelector('.section-header h1');
    if (mainHeader) {
      mainHeader.textContent = t.pageHeader;
    }
    
    // Formular-Labels
    const labelMappings = {
      'vorname': t.vorname,
      'nachname': t.nachname,
      'email': t.email,
      'telefon': t.telefon,
      'adresse': t.adresse,
      'geburtsdatum': t.geburtsdatum
    };
    
    Object.keys(labelMappings).forEach(id => {
      const label = document.querySelector(`label[for="${id}"]`);
      if (label) {
        label.textContent = labelMappings[id];
      }
    });
    
    // Buttons
    const saveButton = document.querySelector('.btn.save');
    if (saveButton) {
      saveButton.textContent = t.saveButton;
    }
    
    const cancelButton = document.querySelector('.btn.cancel');
    if (cancelButton) {
      cancelButton.textContent = t.cancelButton;
    }
    
    // Header-Elemente
    if (userIcon) {
      userIcon.setAttribute('title', t.accountTitle);
    }
    
    // Login-Menü-Links
    const billsLink = document.querySelector('.login-menu a[href*="rechnung"]');
    if (billsLink) {
      billsLink.textContent = t.bills;
    }
    
    const logoutLink = document.querySelector('.login-menu a[href*="Login_Registrieren"]');
    if (logoutLink) {
      logoutLink.textContent = t.logout;
    }
  }

  // Sprach-Button aktualisieren
  function updateLanguageButton(lang) {
    if (langButton) {
      langButton.innerHTML = `${lang.toUpperCase()} <span class="arrow">▾</span>`;
    }
  }

  // Spracheinstellung speichern
  function saveLanguagePreference(lang) {
    try {
      localStorage.setItem('mediassist_language', lang);
    } catch (e) {
      console.log('LocalStorage nicht verfügbar');
    }
  }

  // Gespeicherte Sprache laden
  function loadSavedLanguage() {
    try {
      const savedLang = localStorage.getItem('mediassist_language');
      if (savedLang && translations[savedLang]) {
        changeLanguage(savedLang);
      }
    } catch (e) {
      console.log('LocalStorage nicht verfügbar');
    }
  }

  // Keyboard Navigation für Dropdown
  function setupKeyboardNavigation() {
    if (!langDropdown) return;
    
    const langItems = langDropdown.querySelectorAll('li[data-lang]');
    
    langItems.forEach((item, index) => {
      item.addEventListener('keydown', function(e) {
        let nextIndex;
        
        switch(e.key) {
          case 'ArrowDown':
            e.preventDefault();
            nextIndex = (index + 1) % langItems.length;
            langItems[nextIndex].focus();
            break;
            
          case 'ArrowUp':
            e.preventDefault();
            nextIndex = (index - 1 + langItems.length) % langItems.length;
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
      });
    });
  }

  // Globale Funktionen für eventuelle externe Nutzung
  window.MediAssistLanguage = {
    changeLanguage: changeLanguage,
    getCurrentLanguage: function() { return currentLanguage; },
    translations: translations
  };

})();
