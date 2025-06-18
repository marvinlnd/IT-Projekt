/**
 * MediAssist Language Switcher für Impressum
 * Sprachauswahl-Funktionalität für die Impressum-Seite
 */

(function() {
  'use strict';
  
  // Verhindere mehrfache Initialisierung
  if (window.ImpressumLanguageSwitcher) {
    console.warn('Impressum Language Switcher bereits initialisiert');
    return;
  }

  // Übersetzungen für Impressum-Seite
  const translations = {
    de: {
      // Seitentitel und Navigation
      pageTitle: "MediAssist - Impressum",
      accountTitle: "Konto",
      bills: "Rechnungen",
      logout: "Ausloggen",
      
      // Hauptinhalt
      pageHeader: "Impressum",
      legalInfo: "Angaben gemäß § 5 TMG:",
      contact: "Kontakt:",
      phone: "Telefon:",
      email: "E-Mail:",
      website: "Website:",
      tradeRegister: "Handelsregister:",
      tradeRegisterText: "Eingetragen im Handelsregister des Amtsgerichts Musterstadt",
      registrationNumber: "Registernummer:",
      vatId: "Umsatzsteuer-ID:",
      vatIdText: "Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:",
      responsibleContent: "Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV:",
      disclaimer: "Haftungsausschluss:",
      disclaimerText: "Trotz sorgfältiger inhaltlicher Kontrolle übernehmen wir keine Haftung für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte auf dieser App. Externe Links führen zu Inhalten fremder Anbieter, für die der jeweilige Anbieter oder Betreiber verantwortlich ist. Zum Zeitpunkt der Verlinkung waren keine rechtswidrigen Inhalte erkennbar.",
      disclaimerText2: "Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Inhalte umgehend entfernen.",
      copyright: "Urheberrecht:",
      copyrightText: "Die durch den Seitenbetreiber erstellten Inhalte und Werke auf dieser App unterliegen dem deutschen Urheberrecht. Beiträge Dritter sind als solche gekennzeichnet. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.",
      privacyLink: "Zur Datenschutzerklärung",
      footerText: "© 2025 Jade Hochschule – Impressum"
    },
    en: {
      // Seitentitel und Navigation
      pageTitle: "MediAssist - Imprint",
      accountTitle: "Account",
      bills: "Bills",
      logout: "Logout",
      
      // Hauptinhalt
      pageHeader: "Imprint",
      legalInfo: "Information according to § 5 TMG:",
      contact: "Contact:",
      phone: "Phone:",
      email: "Email:",
      website: "Website:",
      tradeRegister: "Trade Register:",
      tradeRegisterText: "Registered in the trade register of the local court Musterstadt",
      registrationNumber: "Registration number:",
      vatId: "VAT ID:",
      vatIdText: "VAT identification number according to § 27 a VAT law:",
      responsibleContent: "Responsible for content according to § 55 para. 2 RStV:",
      disclaimer: "Disclaimer:",
      disclaimerText: "Despite careful content control, we assume no liability for the correctness, completeness and timeliness of the content of this app. External links lead to content from third-party providers, for which the respective provider or operator is responsible. At the time of linking, no illegal content was recognizable.",
      disclaimerText2: "If we become aware of legal violations, we will remove such content immediately.",
      copyright: "Copyright:",
      copyrightText: "The content and works created by the site operator on this app are subject to German copyright law. Contributions from third parties are marked as such. Reproduction, editing, distribution and any kind of exploitation outside the limits of copyright require the written consent of the respective author or creator.",
      privacyLink: "To Privacy Policy",
      footerText: "© 2025 Jade University – Imprint"
    }
  };

  // Klasse für Language Switcher
  class ImpressumLanguageSwitcher {
    constructor() {
      this.currentLanguage = 'de'; // Standard: Deutsch
      this.elements = {};
      
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
      
      console.log('🌐 Impressum Language Switcher initialisiert');
    }

    // DOM-Elemente finden
    findElements() {
      this.elements = {
        langButton: document.getElementById('lang-button'),
        langDropdown: document.getElementById('lang-dropdown'),
        userLoginIcon: document.getElementById('login-icon'),
        pageTitle: document.querySelector('title'),
        pageHeader: document.querySelector('h1'),
        container: document.querySelector('.container')
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
      
      console.log(`🌐 Impressum Sprache geändert zu: ${lang.toUpperCase()}`);
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
      
      // Header-Elemente
      if (elements.userLoginIcon) {
        elements.userLoginIcon.setAttribute('title', t.accountTitle);
      }
      
      // Navigation-Links
      this.updateNavigationLinks(t);
      
      // Hauptinhalt
      this.updateMainContent(t);
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

    // Hauptinhalt aktualisieren
    updateMainContent(t) {
      if (!this.elements.container) return;

      // Alle relevanten Textelemente finden und übersetzen
      const contentMapping = [
        { selector: 'p:nth-of-type(1) strong', text: t.legalInfo },
        { selector: 'p:nth-of-type(3) strong', text: t.contact },
        { selector: 'p:nth-of-type(5) strong', text: t.tradeRegister },
        { selector: 'p:nth-of-type(7) strong', text: t.vatId },
        { selector: 'p:nth-of-type(9) strong', text: t.responsibleContent },
        { selector: 'p:nth-of-type(11) strong', text: t.disclaimer },
        { selector: 'p:nth-of-type(13) strong', text: t.copyright },
        { selector: 'a[href*="Datenschutz"]', text: t.privacyLink },
        { selector: 'footer', text: t.footerText }
      ];

      contentMapping.forEach(({ selector, text }) => {
        const element = this.elements.container.querySelector(selector);
        if (element) {
          element.textContent = text;
        }
      });

      // Spezielle Textblöcke
      this.updateSpecificTexts(t);
    }

    // Spezifische Texte aktualisieren
    updateSpecificTexts(t) {
      const paragraphs = this.elements.container.querySelectorAll('p');
      
      // Kontakt-Info aktualisieren
      paragraphs.forEach((p, index) => {
        const text = p.textContent.trim();
        
        if (text.includes('Telefon:') || text.includes('Phone:')) {
          p.innerHTML = `${t.phone} +49 4421 985-0<br>${t.email} info@jade-hs.de<br>${t.website} <a href="https://www.jade-hs.de"> www.jade-hs.de</a>`;
        }
        
        if (text.includes('Eingetragen im Handelsregister') || text.includes('Registered in the trade register')) {
          p.innerHTML = `${t.tradeRegisterText}<br>${t.registrationNumber} HRB 123456`;
        }
        
        if (text.includes('Umsatzsteuer-Identifikationsnummer') || text.includes('VAT identification number')) {
          p.innerHTML = `${t.vatIdText}<br>DE123456789`;
        }
        
        if (text.includes('Trotz sorgfältiger') || text.includes('Despite careful')) {
          p.textContent = t.disclaimerText;
        }
        
        if (text.includes('Bei Bekanntwerden') || text.includes('If we become aware')) {
          p.textContent = t.disclaimerText2;
        }
        
        if (text.includes('Die durch den Seitenbetreiber') || text.includes('The content and works')) {
          p.textContent = t.copyrightText;
        }
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
        localStorage.setItem('mediassist_language_impressum', lang);
      } catch (e) {
        console.warn('LocalStorage nicht verfügbar');
      }
    }

    // Gespeicherte Sprache laden
    loadSavedLanguage() {
      try {
        const savedLang = localStorage.getItem('mediassist_language_impressum') || 
                         localStorage.getItem('mediassist_language') || 'de';
        if (savedLang && translations[savedLang]) {
          this.changeLanguage(savedLang);
        }
      } catch (e) {
        console.warn('LocalStorage nicht verfügbar');
      }
    }

    // Hilfsfunktionen für externe Nutzung
    getTranslation(key) {
      return translations[this.currentLanguage]?.[key] || key;
    }

    getCurrentLanguage() {
      return this.currentLanguage;
    }
  }

  // Globale Instanz erstellen
  const impressumLanguageSwitcher = new ImpressumLanguageSwitcher();

  // Globale API für externe Nutzung
  window.ImpressumLanguageSwitcher = {
    instance: impressumLanguageSwitcher,
    changeLanguage: (lang) => impressumLanguageSwitcher.changeLanguage(lang),
    getCurrentLanguage: () => impressumLanguageSwitcher.getCurrentLanguage(),
    getTranslation: (key) => impressumLanguageSwitcher.getTranslation(key),
    translations: translations
  };

})();
