// ============================
// Sprachauswahl für Rechnungsseite  
// ============================

// Übersetzungen für die Rechnungsseite
const translations = {
  de: {
    // Seite & Header
    'page.title': 'Rechnungen – MediAssist',
    'header.invoices': 'Rechnungen',
    'nav.logout': 'Ausloggen',
    
    // Tabelle
    'table.month': 'Monat',
    'table.activities': 'Aktivitäten',
    'table.amount': 'Betrag',
    'table.status': 'Status',
    'table.due_date': 'Fällig am',
    'table.actions': 'Aktionen',
    
    // Status
    'status.paid': '✓ Bezahlt',
    'status.open': '○ Offen', 
    'status.overdue': '! Überfällig',
    
    // Buttons
    'button.details': 'Details',
    'button.pay': 'Bezahlen',
    
    // Zusammenfassung
    'summary.title': 'Zusammenfassung',
    'summary.total_activities': 'Gesamte Aktivitäten:',
    'summary.total_amount': 'Gesamtbetrag:',
    'summary.open_amount': 'Offener Betrag:',
    
    // Meldungen
    'message.loading': 'Lade Rechnungen...',
    'message.no_invoices': '📄 Noch keine Rechnungen vorhanden. Rechnungen werden automatisch erstellt.',
    'message.not_logged_in': '🔐 Bitte anmelden',
    'message.firebase_error': '❌ Firebase SDK nicht geladen',
    'message.error_loading': 'Fehler beim Laden. Bitte neu laden oder anmelden.',
    'message.firebase_index': '🔧 Firebase Index erforderlich',
    'message.create_index': 'Index erstellen',
    'message.reload_after': 'Nach dem Erstellen Seite neu laden.',
    
    // Sonstiges
    'text.per_activity': 'pro Aktivität',
    'text.paid_on': 'Bezahlt:',
    'text.unknown': 'Unbekannt',
    'text.no_note': 'Keine Notiz',
    
    // Dialoge
    'dialog.invoice_not_found': 'Rechnung nicht gefunden.',
    'dialog.confirm_payment': 'Zahlung bestätigen?',
    'dialog.amount': 'Betrag:',
    'dialog.payment_success': 'Zahlung erfolgreich!',
    'dialog.payment_error': 'Fehler bei der Zahlung',
    
    // Footer
    'footer.privacy': 'Datenschutzerklärung',
    'footer.imprint': 'Impressum',
    
    // Monate
    'month.january': 'Januar', 'month.february': 'Februar', 'month.march': 'März',
    'month.april': 'April', 'month.may': 'Mai', 'month.june': 'Juni',
    'month.july': 'Juli', 'month.august': 'August', 'month.september': 'September',
    'month.october': 'Oktober', 'month.november': 'November', 'month.december': 'Dezember'
  },
  en: {
    // Seite & Header
    'page.title': 'Invoices – MediAssist',
    'header.invoices': 'Invoices',
    'nav.logout': 'Logout',
    
    // Tabelle
    'table.month': 'Month',
    'table.activities': 'Activities',
    'table.amount': 'Amount',
    'table.status': 'Status',
    'table.due_date': 'Due Date',
    'table.actions': 'Actions',
    
    // Status
    'status.paid': '✓ Paid',
    'status.open': '○ Open',
    'status.overdue': '! Overdue',
    
    // Buttons
    'button.details': 'Details',
    'button.pay': 'Pay',
    
    // Zusammenfassung
    'summary.title': 'Summary',
    'summary.total_activities': 'Total Activities:',
    'summary.total_amount': 'Total Amount:',
    'summary.open_amount': 'Outstanding Amount:',
    
    // Meldungen
    'message.loading': 'Loading invoices...',
    'message.no_invoices': '📄 No invoices available yet. Invoices will be created automatically.',
    'message.not_logged_in': '🔐 Please log in',
    'message.firebase_error': '❌ Firebase SDK not loaded',
    'message.error_loading': 'Error loading. Please reload or log in.',
    'message.firebase_index': '🔧 Firebase Index required',
    'message.create_index': 'Create Index',
    'message.reload_after': 'Reload page after creating.',
    
    // Sonstiges
    'text.per_activity': 'per activity',
    'text.paid_on': 'Paid:',
    'text.unknown': 'Unknown',
    'text.no_note': 'No note',
    
    // Dialoge
    'dialog.invoice_not_found': 'Invoice not found.',
    'dialog.confirm_payment': 'Confirm payment?',
    'dialog.amount': 'Amount:',
    'dialog.payment_success': 'Payment successful!',
    'dialog.payment_error': 'Payment error',
    
    // Footer
    'footer.privacy': 'Privacy Policy',
    'footer.imprint': 'Legal Notice',
    
    // Monate
    'month.january': 'January', 'month.february': 'February', 'month.march': 'March',
    'month.april': 'April', 'month.may': 'May', 'month.june': 'June',
    'month.july': 'July', 'month.august': 'August', 'month.september': 'September',
    'month.october': 'October', 'month.november': 'November', 'month.december': 'December'
  }
};

class LanguageSwitcher {
  constructor() {
    this.currentLanguage = localStorage.getItem('selectedLanguage') || 'de';
    this.langButton = document.getElementById('lang-button');
    this.langDropdown = document.getElementById('lang-dropdown');
    this.originalAlert = window.alert;
    this.originalConfirm = window.confirm;
    
    this.init();
  }

  init() {
    if (!this.langButton || !this.langDropdown) {
      console.warn('Sprachauswahl-Elemente nicht gefunden');
      return;
    }

    this.addStyles();
    this.setupEventListeners();
    this.setupDialogOverrides();
    this.updateButtonText();
    this.applyTranslations();
    this.startContentObserver();
  }

  addStyles() {
    if (document.getElementById('language-switcher-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'language-switcher-styles';
    style.textContent = `
      .lang-dropdown {
        display: none;
        position: absolute;
        top: 100%;
        right: 0;
        background: white;
        border: 1px solid #ddd;
        border-radius: 4px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        min-width: 80px;
        z-index: 1000;
        list-style: none;
        margin: 0;
        padding: 0;
      }
      
      .lang-dropdown.open {
        display: block;
      }
      
      .lang-dropdown li {
        padding: 8px 12px;
        cursor: pointer;
        transition: background-color 0.2s;
      }
      
      .lang-dropdown li:hover,
      .lang-dropdown li:focus {
        background-color: #f8f9fa;
        outline: none;
      }
      
      .lang-dropdown li:first-child {
        border-radius: 4px 4px 0 0;
      }
      
      .lang-dropdown li:last-child {
        border-radius: 0 0 4px 4px;
      }
      
      .language-switcher {
        position: relative;
      }
      
      #lang-button {
        background: none;
        border: none;
        cursor: pointer;
        padding: 8px 12px;
        font-size: 14px;
        color: #333;
        transition: color 0.2s;
      }
      
      #lang-button:hover {
        color: #007bff;
      }
      
      .arrow {
        margin-left: 4px;
        transition: transform 0.2s;
      }
      
      #lang-button[aria-expanded="true"] .arrow {
        transform: rotate(180deg);
      }
    `;
    document.head.appendChild(style);
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

  setupDialogOverrides() {
    // Alert überschreiben für bidirektionale Übersetzung
    window.alert = (message) => {
      let translatedMessage = message;
      
      if (message.includes('Rechnung nicht gefunden') || message.includes('Invoice not found')) {
        translatedMessage = this.getTranslation('dialog.invoice_not_found');
      } else if (message.includes('Zahlung erfolgreich') || message.includes('Payment successful')) {
        translatedMessage = this.getTranslation('dialog.payment_success');
      } else if (message.includes('Fehler bei der Zahlung') || message.includes('Payment error')) {
        translatedMessage = this.getTranslation('dialog.payment_error');
      }
      
      return this.originalAlert(translatedMessage);
    };

    // Confirm überschreiben für bidirektionale Übersetzung
    window.confirm = (message) => {
      let translatedMessage = message;
      
      if (message.includes('Zahlung bestätigen') || message.includes('Confirm payment')) {
        const amountMatch = message.match(/(?:Betrag:|Amount:)\s*(.+)/);
        const amount = amountMatch ? amountMatch[1].trim() : '';
        
        if (amount) {
          translatedMessage = `${this.getTranslation('dialog.confirm_payment')}\n${this.getTranslation('dialog.amount')} ${amount}`;
        } else {
          translatedMessage = this.getTranslation('dialog.confirm_payment');
        }
      }
      
      return this.originalConfirm(translatedMessage);
    };
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
    
    // Event für andere Skripte
    window.dispatchEvent(new CustomEvent('languageChanged', { 
      detail: { language: lang } 
    }));
  }

  updateButtonText() {
    this.langButton.innerHTML = `${this.currentLanguage.toUpperCase()} <span class="arrow">▾</span>`;
  }

  applyTranslations() {
    // Seiten-Titel
    document.title = this.getTranslation('page.title');
    
    // Alle statischen Elemente
    this.translateStaticElements();
    
    // Dynamische Inhalte
    this.translateDynamicContent();
  }

  translateStaticElements() {
    // Hauptüberschrift
    const mainHeading = document.querySelector('main h1');
    if (mainHeading) {
      mainHeading.textContent = this.getTranslation('header.invoices');
    }

    // Navigation
    const logoutLink = document.querySelector('#login-menu a[href*="Login"]');
    if (logoutLink) {
      logoutLink.textContent = this.getTranslation('nav.logout');
    }
    
    const invoicesLink = document.querySelector('#login-menu a[href*="rechnung"]');
    if (invoicesLink) {
      invoicesLink.textContent = this.getTranslation('header.invoices');
    }

    // Footer
    const footerLinks = document.querySelectorAll('.footer-nav a');
    footerLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href && href.includes('Datenschutzerklärung')) {
        link.textContent = this.getTranslation('footer.privacy');
      } else if (href && href.includes('Impressum')) {
        link.textContent = this.getTranslation('footer.imprint');
      }
    });
  }

  translateDynamicContent() {
    // Tabellen-Header
    this.translateTableHeaders();
    
    // Rechnungszeilen
    this.translateInvoiceRows();
    
    // Status-Badges
    this.translateStatusBadges();
    
    // Buttons
    this.translateButtons();
    
    // Zusammenfassung
    this.translateSummary();
    
    // Nachrichten
    this.translateMessages();
  }

  translateTableHeaders() {
    const table = document.querySelector('.invoices-table');
    if (table) {
      const headers = table.querySelectorAll('th');
      const headerKeys = [
        'table.month', 'table.activities', 'table.amount', 
        'table.status', 'table.due_date', 'table.actions'
      ];
      
      headers.forEach((header, index) => {
        if (headerKeys[index]) {
          header.textContent = this.getTranslation(headerKeys[index]);
        }
      });
    }
  }

  translateInvoiceRows() {
    const rows = document.querySelectorAll('.invoices-table tbody tr');
    rows.forEach(row => {
      const cells = row.querySelectorAll('td');
      
      // Monatsnamen übersetzen
      if (cells[0]) {
        const monthCell = cells[0];
        let monthHTML = monthCell.innerHTML;
        monthHTML = this.translateMonthNames(monthHTML);
        monthCell.innerHTML = monthHTML;
      }
      
      // "pro Aktivität" / "per activity" übersetzen
      if (cells[2]) {
        const amountCell = cells[2];
        let amountHTML = amountCell.innerHTML;
        amountHTML = amountHTML
          .replace(/pro Aktivität/gi, this.getTranslation('text.per_activity'))
          .replace(/per activity/gi, this.getTranslation('text.per_activity'));
        amountCell.innerHTML = amountHTML;
      }
      
      // "Bezahlt:" / "Paid:" übersetzen
      if (cells[4]) {
        const dueDateCell = cells[4];
        let dueDateHTML = dueDateCell.innerHTML;
        dueDateHTML = dueDateHTML
          .replace(/Bezahlt:/gi, this.getTranslation('text.paid_on'))
          .replace(/Paid:/gi, this.getTranslation('text.paid_on'));
        dueDateCell.innerHTML = dueDateHTML;
      }
    });
  }

  translateMonthNames(text) {
    const monthMapping = {
      de: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
           'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
      en: ['January', 'February', 'March', 'April', 'May', 'June',
           'July', 'August', 'September', 'October', 'November', 'December']
    };
    
    let translatedText = text;
    
    // Erkenne aktuelle Sprache im Text und übersetze entsprechend
    const hasGerman = monthMapping.de.some(month => text.includes(month));
    const hasEnglish = monthMapping.en.some(month => text.includes(month));
    
    if (this.currentLanguage === 'en' && hasGerman) {
      // Deutsch zu Englisch
      monthMapping.de.forEach((deMonth, index) => {
        const enMonth = monthMapping.en[index];
        translatedText = translatedText.replace(new RegExp(deMonth, 'gi'), enMonth);
      });
    } else if (this.currentLanguage === 'de' && hasEnglish) {
      // Englisch zu Deutsch
      monthMapping.en.forEach((enMonth, index) => {
        const deMonth = monthMapping.de[index];
        translatedText = translatedText.replace(new RegExp(enMonth, 'gi'), deMonth);
      });
    }
    
    return translatedText;
  }

  translateStatusBadges() {
    const statusBadges = document.querySelectorAll('.status-badge');
    statusBadges.forEach(badge => {
      const text = badge.textContent.trim();
      
      if (text.includes('✓') && (text.includes('Bezahlt') || text.includes('Paid'))) {
        badge.textContent = this.getTranslation('status.paid');
      } else if (text.includes('○') && (text.includes('Offen') || text.includes('Open'))) {
        badge.textContent = this.getTranslation('status.open');
      } else if (text.includes('!') && (text.includes('Überfällig') || text.includes('Overdue'))) {
        badge.textContent = this.getTranslation('status.overdue');
      }
    });
  }

  translateButtons() {
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
      const text = button.textContent.trim();
      
      if (text === 'Details') {
        button.textContent = this.getTranslation('button.details');
      } else if (text === 'Bezahlen' || text === 'Pay') {
        button.textContent = this.getTranslation('button.pay');
      }
    });
  }

  translateSummary() {
    const summaryTitle = document.querySelector('.invoice-summary h2');
    if (summaryTitle) {
      summaryTitle.textContent = this.getTranslation('summary.title');
    }
    
    const statItems = document.querySelectorAll('.stat-item span:first-child');
    statItems.forEach(item => {
      const text = item.textContent.trim();
      
      if (text.includes('Gesamte Aktivitäten') || text.includes('Total Activities')) {
        item.textContent = this.getTranslation('summary.total_activities');
      } else if (text.includes('Gesamtbetrag') || text.includes('Total Amount')) {
        item.textContent = this.getTranslation('summary.total_amount');
      } else if (text.includes('Offener Betrag') || text.includes('Outstanding Amount')) {
        item.textContent = this.getTranslation('summary.open_amount');
      }
    });
  }

  translateMessages() {
    const invoicesList = document.querySelector('.invoices');
    if (invoicesList) {
      const paragraphs = invoicesList.querySelectorAll('p');
      paragraphs.forEach(p => {
        const text = p.textContent.trim();
        
        if (text.includes('Lade Rechnungen') || text.includes('Loading invoices')) {
          p.textContent = this.getTranslation('message.loading');
        } else if (text.includes('Noch keine Rechnungen') || text.includes('No invoices available')) {
          p.innerHTML = this.getTranslation('message.no_invoices');
        } else if (text.includes('Bitte anmelden') || text.includes('Please log in')) {
          p.innerHTML = `<span style="text-align: center; padding: 40px;">${this.getTranslation('message.not_logged_in')}</span>`;
        } else if (text.includes('Firebase SDK') || text.includes('Firebase SDK not loaded')) {
          p.innerHTML = this.getTranslation('message.firebase_error');
        } else if (text.includes('Fehler beim Laden') || text.includes('Error loading')) {
          p.textContent = this.getTranslation('message.error_loading');
        }
      });
    }
    
    // Firebase Index Meldungen
    const indexMessages = document.querySelectorAll('h3, a, p');
    indexMessages.forEach(element => {
      const text = element.textContent;
      if (text.includes('Firebase Index erforderlich') || text.includes('Firebase Index required')) {
        element.textContent = this.getTranslation('message.firebase_index');
      } else if (text.includes('Index erstellen') || text.includes('Create Index')) {
        element.textContent = this.getTranslation('message.create_index');
      } else if (text.includes('Nach dem Erstellen') || text.includes('Reload page after')) {
        element.textContent = this.getTranslation('message.reload_after');
      }
    });
  }

  startContentObserver() {
    const observer = new MutationObserver((mutations) => {
      let shouldTranslate = false;
      
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              if (node.classList?.contains('invoices-table') || 
                  node.classList?.contains('invoice-summary') ||
                  node.tagName === 'P' ||
                  node.tagName === 'TABLE') {
                shouldTranslate = true;
              }
            }
          });
        }
      });
      
      if (shouldTranslate) {
        setTimeout(() => {
          this.translateDynamicContent();
        }, 50);
      }
    });
    
    // Hauptcontainer beobachten
    const mainContainer = document.querySelector('main');
    if (mainContainer) {
      observer.observe(mainContainer, {
        childList: true,
        subtree: true
      });
    }
    
    // Body für Summary-Elemente beobachten
    observer.observe(document.body, {
      childList: true,
      subtree: false
    });
  }

  // Public Methods
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
function initLanguageSupport() {
  languageSwitcher = new LanguageSwitcher();
  
  // Periodische Übersetzung als Backup
  setInterval(() => {
    if (languageSwitcher) {
      languageSwitcher.translateDynamicContent();
    }
  }, 2000);
}

// Event-Listener für DOM-Ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLanguageSupport);
} else {
  initLanguageSupport();
}

// Auch auf window load reagieren
window.addEventListener('load', () => {
  setTimeout(() => {
    if (languageSwitcher) {
      languageSwitcher.applyTranslations();
    }
  }, 100);
});

// Cleanup
window.addEventListener('beforeunload', () => {
  // Cleanup falls nötig
});

// Export für rechnung.js
window.getTranslation = function(key) {
  return languageSwitcher ? languageSwitcher.getTranslation(key) : key;
};

window.getCurrentLanguage = function() {
  return languageSwitcher ? languageSwitcher.getCurrentLanguage() : 'de';
};

// Export für andere Module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { 
    translations, 
    LanguageSwitcher
  };
}
