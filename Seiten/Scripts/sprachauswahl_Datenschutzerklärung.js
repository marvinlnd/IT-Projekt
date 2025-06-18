/**
 * MediAssist Language Switcher für Datenschutzerklärung
 * Sprachauswahl-Funktionalität für die Datenschutzerklärung-Seite
 */

(function() {
  'use strict';
  
  // Verhindere mehrfache Initialisierung
  if (window.DatenschutzLanguageSwitcher) {
    console.warn('Datenschutz Language Switcher bereits initialisiert');
    return;
  }

  // Übersetzungen für Datenschutzerklärung-Seite
  const translations = {
    de: {
      // Seitentitel und Navigation
      pageTitle: "MediAssist - Datenschutzerklärung",
      accountTitle: "Konto",
      bills: "Rechnungen",
      logout: "Ausloggen",
      
      // Hauptinhalt
      pageHeader: "Datenschutzerklärung",
      section1: "1. Allgemeine Hinweise",
      section1Text: "Der Schutz Ihrer persönlichen Daten ist uns sehr wichtig. Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend der gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerklärung. Diese Erklärung informiert Sie über Art, Umfang und Zweck der Erhebung und Verwendung personenbezogener Daten innerhalb unserer App.",
      
      section2: "2. Verantwortliche Stelle",
      section2Text: "Jade Hochschule\nFriedrich-Paffrath-Str. 101\n26389 Wilhelmshaven\nWebseite: www.jade-hs.de",
      
      section3: "3. Datenverarbeitung in der App",
      section3Text: "Bei der Nutzung unserer App werden automatisch technische Daten erfasst, wie z. B.:",
      section3List: [
        "IP-Adresse des Geräts",
        "Datum und Uhrzeit des Zugriffs",
        "Gerätetyp, Betriebssystem und App-Version",
        "Verwendete Funktionen innerhalb der App"
      ],
      section3Text2: "Diese Daten dienen ausschließlich der technischen Optimierung und der Sicherheit unserer Dienste. Eine Zusammenführung mit anderen Datenquellen findet nicht statt.",
      
      section4: "4. Verarbeitung durch Dritte",
      section4Text: "Sofern externe Dienste wie Hosting, Analyse-Tools oder Push-Benachrichtigungen eingebunden sind, erfolgt dies unter Einhaltung der DSGVO. Verträge zur Auftragsverarbeitung (AV-Verträge) bestehen mit allen externen Dienstleistern.",
      
      section5: "5. Rechte der betroffenen Personen",
      section5Text: "Sie haben das Recht:",
      section5List: [
        "gemäß Art. 15 DSGVO Auskunft über Ihre gespeicherten Daten zu verlangen,",
        "gemäß Art. 16 DSGVO Berichtigung unrichtiger Daten zu verlangen,",
        "gemäß Art. 17 DSGVO Löschung Ihrer Daten zu verlangen (Recht auf Vergessenwerden),",
        "gemäß Art. 18 DSGVO Einschränkung der Verarbeitung zu verlangen,",
        "gemäß Art. 20 DSGVO Ihre Daten in einem übertragbaren Format zu erhalten,",
        "gemäß Art. 21 DSGVO Widerspruch gegen bestimmte Verarbeitungen einzulegen."
      ],
      
      section6: "6. Speicherung und Löschung",
      section6Text: "Personenbezogene Daten werden nur solange gespeichert, wie es für den jeweiligen Zweck erforderlich ist oder gesetzlich vorgeschrieben ist. Danach erfolgt eine automatische Löschung.",
      
      section7: "7. Sicherheit",
      section7Text: "Unsere App verwendet moderne Verschlüsselungsverfahren und technische Sicherheitsmaßnahmen, um Ihre Daten bestmöglich zu schützen. Der Zugriff ist auf befugte Personen beschränkt.",
      
      section8: "8. Änderungen dieser Erklärung",
      section8Text: "Diese Datenschutzerklärung kann regelmäßig aktualisiert werden, um rechtlichen Anforderungen oder Änderungen unserer App-Funktionalität gerecht zu werden. Die jeweils aktuelle Version finden Sie jederzeit in der App unter \"Datenschutz\".",
      
      imprintLink: "Zum Impressum",
      footerText: "© 2025 Jade Hochschule – Datenschutz"
    },
    en: {
      // Seitentitel und Navigation
      pageTitle: "MediAssist - Privacy Policy",
      accountTitle: "Account",
      bills: "Bills",
      logout: "Logout",
      
      // Hauptinhalt
      pageHeader: "Privacy Policy",
      section1: "1. General Information",
      section1Text: "The protection of your personal data is very important to us. We treat your personal data confidentially and in accordance with the legal data protection regulations and this privacy policy. This statement informs you about the type, scope and purpose of the collection and use of personal data within our app.",
      
      section2: "2. Responsible Authority",
      section2Text: "Jade University\nFriedrich-Paffrath-Str. 101\n26389 Wilhelmshaven\nWebsite: www.jade-hs.de",
      
      section3: "3. Data Processing in the App",
      section3Text: "When using our app, technical data is automatically collected, such as:",
      section3List: [
        "IP address of the device",
        "Date and time of access",
        "Device type, operating system and app version",
        "Functions used within the app"
      ],
      section3Text2: "This data is used exclusively for technical optimization and security of our services. No merging with other data sources takes place.",
      
      section4: "4. Processing by Third Parties",
      section4Text: "If external services such as hosting, analysis tools or push notifications are integrated, this is done in compliance with the GDPR. Data processing agreements (DPA contracts) exist with all external service providers.",
      
      section5: "5. Rights of Data Subjects",
      section5Text: "You have the right:",
      section5List: [
        "according to Art. 15 GDPR to request information about your stored data,",
        "according to Art. 16 GDPR to request correction of incorrect data,",
        "according to Art. 17 GDPR to request deletion of your data (right to be forgotten),",
        "according to Art. 18 GDPR to request restriction of processing,",
        "according to Art. 20 GDPR to receive your data in a transferable format,",
        "according to Art. 21 GDPR to object to certain processing operations."
      ],
      
      section6: "6. Storage and Deletion",
      section6Text: "Personal data is only stored for as long as it is necessary for the respective purpose or as legally required. After that, automatic deletion takes place.",
      
      section7: "7. Security",
      section7Text: "Our app uses modern encryption methods and technical security measures to protect your data as best as possible. Access is restricted to authorized persons.",
      
      section8: "8. Changes to this Statement",
      section8Text: "This privacy policy may be updated regularly to meet legal requirements or changes to our app functionality. You can always find the current version in the app under \"Privacy\".",
      
      imprintLink: "To Imprint",
      footerText: "© 2025 Jade University – Privacy"
    }
  };

  // Klasse für Language Switcher
  class DatenschutzLanguageSwitcher {
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
      
      console.log('🌐 Datenschutz Language Switcher initialisiert');
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
      
      console.log(`🌐 Datenschutz Sprache geändert zu: ${lang.toUpperCase()}`);
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

      // Alle Paragraphen finden
      const paragraphs = this.elements.container.querySelectorAll('p');
      const strongElements = this.elements.container.querySelectorAll('p strong');
      const lists = this.elements.container.querySelectorAll('ul');

      // Section-Header aktualisieren
      strongElements.forEach((strong, index) => {
        const sectionKey = `section${index + 1}`;
        if (t[sectionKey]) {
          strong.textContent = t[sectionKey];
        }
      });

      // Textinhalte aktualisieren
      this.updateTextContent(t, paragraphs);
      
      // Listen aktualisieren
      this.updateLists(t, lists);

      // Links und Footer
      const imprintLink = this.elements.container.querySelector('a[href*="Impressum"]');
      if (imprintLink) {
        imprintLink.textContent = t.imprintLink;
      }

      const footer = this.elements.container.querySelector('footer');
      if (footer) {
        footer.textContent = t.footerText;
      }
    }

    // Textinhalte aktualisieren
    updateTextContent(t, paragraphs) {
      paragraphs.forEach(p => {
        const text = p.textContent.trim();
        
        if (text.includes('Der Schutz Ihrer') || text.includes('The protection of your')) {
          p.textContent = t.section1Text;
        }
        else if (text.includes('Jade Hochschule') || text.includes('Jade University')) {
          p.innerHTML = t.section2Text.replace(/\n/g, '<br>');
        }
        else if (text.includes('Bei der Nutzung') || text.includes('When using our app')) {
          p.textContent = t.section3Text;
        }
        else if (text.includes('Diese Daten dienen') || text.includes('This data is used')) {
          p.textContent = t.section3Text2;
        }
        else if (text.includes('Sofern externe') || text.includes('If external services')) {
          p.textContent = t.section4Text;
        }
        else if (text.includes('Sie haben das Recht') || text.includes('You have the right')) {
          p.textContent = t.section5Text;
        }
        else if (text.includes('Personenbezogene Daten') || text.includes('Personal data is only')) {
          p.textContent = t.section6Text;
        }
        else if (text.includes('Unsere App verwendet') || text.includes('Our app uses')) {
          p.textContent = t.section7Text;
        }
        else if (text.includes('Diese Datenschutzerklärung') || text.includes('This privacy policy')) {
          p.textContent = t.section8Text;
        }
      });
    }

    // Listen aktualisieren
    updateLists(t, lists) {
      lists.forEach((ul, index) => {
        const items = ul.querySelectorAll('li');
        
        if (index === 0 && t.section3List) {
          // Erste Liste - technische Daten
          items.forEach((li, i) => {
            if (t.section3List[i]) {
              li.textContent = t.section3List[i];
            }
          });
        }
        else if (index === 1 && t.section5List) {
          // Zweite Liste - Rechte der betroffenen Personen
          items.forEach((li, i) => {
            if (t.section5List[i]) {
              li.textContent = t.section5List[i];
            }
          });
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
        localStorage.setItem('mediassist_language_datenschutz', lang);
      } catch (e) {
        console.warn('LocalStorage nicht verfügbar');
      }
    }

    // Gespeicherte Sprache laden
    loadSavedLanguage() {
      try {
        const savedLang = localStorage.getItem('mediassist_language_datenschutz') || 
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
  const datenschutzLanguageSwitcher = new DatenschutzLanguageSwitcher();

  // Globale API für externe Nutzung
  window.DatenschutzLanguageSwitcher = {
    instance: datenschutzLanguageSwitcher,
    changeLanguage: (lang) => datenschutzLanguageSwitcher.changeLanguage(lang),
    getCurrentLanguage: () => datenschutzLanguageSwitcher.getCurrentLanguage(),
    getTranslation: (key) => datenschutzLanguageSwitcher.getTranslation(key),
    translations: translations
  };

})();
