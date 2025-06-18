// ============================
// Sprachauswahl für Rechnungsseite
// ============================

// Übersetzungen für die Rechnungsseite
const translations = {
  de: {
    'page.title': 'Rechnungen – MediAssist',
    'header.invoices': 'Rechnungen',
    'invoices.summary': 'Gesamtübersicht',
    'invoices.open': 'Offene Rechnungen',
    'invoices.paid': 'Bezahlte Rechnungen',
    'invoices.no_invoices': 'Noch keine Rechnungen vorhanden. Rechnungen werden automatisch erstellt.',
    'table.month': 'Monat',
    'table.activities': 'Aktivitäten',
    'table.amount': 'Betrag',
    'table.status': 'Status',
    'table.due_date': 'Fällig am',
    'table.paid_date': 'Bezahlt am',
    'table.actions': 'Aktionen',
    'button.details': 'Details',
    'button.pay': 'Bezahlen',
    'status.open': 'Offen',
    'status.paid': 'Bezahlt',
    'status.overdue': 'Überfällig',
    'summary.total_activities': 'Gesamte Aktivitäten:',
    'summary.total_amount': 'Gesamtbetrag:',
    'summary.paid_amount': 'Bereits bezahlt:',
    'summary.open_amount': 'Noch offen:',
    'details.invoice_details': 'RECHNUNGSDETAILS',
    'details.activities_label': 'Anzahl Aktivitäten:',
    'details.total_amount': 'Gesamtbetrag:',
    'details.status': 'Status:',
    'details.due_date': 'Fälligkeitsdatum:',
    'details.paid_date': 'Bezahlt am:',
    'details.invoiced_activities': 'ABGERECHNETE AKTIVITÄTEN:',
    'details.no_details': 'Keine Details verfügbar',
    'payment.confirm': 'Zahlung bestätigen?',
    'payment.amount': 'Betrag:',
    'payment.success': 'Zahlung erfolgreich verarbeitet!',
    'payment.error': 'Fehler beim Verarbeiten der Zahlung. Bitte versuchen Sie es erneut.',
    'error.not_found': 'Rechnung nicht gefunden.',
    'error.already_paid': 'Rechnung nicht gefunden oder bereits bezahlt.',
    'per_activity': 'pro Aktivität',
    'footer.datenschutz': 'Datenschutzerklärung',
    'footer.impressum': 'Impressum'
  },
  en: {
    'page.title': 'Invoices – MediAssist',
    'header.invoices': 'Invoices',
    'invoices.summary': 'Overview',
    'invoices.open': 'Open Invoices',
    'invoices.paid': 'Paid Invoices',
    'invoices.no_invoices': 'No invoices available yet. Invoices will be created automatically.',
    'table.month': 'Month',
    'table.activities': 'Activities',
    'table.amount': 'Amount',
    'table.status': 'Status',
    'table.due_date': 'Due Date',
    'table.paid_date': 'Paid Date',
    'table.actions': 'Actions',
    'button.details': 'Details',
    'button.pay': 'Pay',
    'status.open': 'Open',
    'status.paid': 'Paid',
    'status.overdue': 'Overdue',
    'summary.total_activities': 'Total Activities:',
    'summary.total_amount': 'Total Amount:',
    'summary.paid_amount': 'Already Paid:',
    'summary.open_amount': 'Still Open:',
    'details.invoice_details': 'INVOICE DETAILS',
    'details.activities_label': 'Number of Activities:',
    'details.total_amount': 'Total Amount:',
    'details.status': 'Status:',
    'details.due_date': 'Due Date:',
    'details.paid_date': 'Paid Date:',
    'details.invoiced_activities': 'INVOICED ACTIVITIES:',
    'details.no_details': 'No details available',
    'payment.confirm': 'Confirm payment?',
    'payment.amount': 'Amount:',
    'payment.success': 'Payment processed successfully!',
    'payment.error': 'Error processing payment. Please try again.',
    'error.not_found': 'Invoice not found.',
    'error.already_paid': 'Invoice not found or already paid.',
    'per_activity': 'per activity',
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
    const arrow = this.langButton.querySelector('.arrow');
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

    // Spezifische Rechnungsseiten-Elemente übersetzen
    this.translateInvoiceElements(currentTranslations);
    
    // Header übersetzen
    const headerH1 = document.querySelector('main h1');
    if (headerH1) {
      headerH1.textContent = currentTranslations['header.invoices'];
    }

    // Navigation übersetzen
    this.translateNavigation(currentTranslations);
  }

  translateInvoiceElements(translations) {
    // Tabellen-Header übersetzen
    document.querySelectorAll('.invoices-table th').forEach((th, index) => {
      const keys = ['table.month', 'table.activities', 'table.amount', 'table.status', 'table.due_date', 'table.actions'];
      if (keys[index] && translations[keys[index]]) {
        th.textContent = translations[keys[index]];
      }
    });

    // Bezahlte Tabelle Header
    document.querySelectorAll('.invoices-section').forEach(section => {
      const header = section.querySelector('h3');
      if (header) {
        if (header.textContent.includes('Offene')) {
          header.innerHTML = header.innerHTML.replace(/Offene Rechnungen/, translations['invoices.open']);
        } else if (header.textContent.includes('Bezahlte')) {
          header.innerHTML = header.innerHTML.replace(/Bezahlte Rechnungen/, translations['invoices.paid']);
          // Bezahlte Tabelle hat anderen Header
          const table = section.querySelector('table');
          if (table) {
            const headers = table.querySelectorAll('th');
            const paidKeys = ['table.month', 'table.activities', 'table.amount', 'table.status', 'table.paid_date', 'table.actions'];
            headers.forEach((th, index) => {
              if (paidKeys[index] && translations[paidKeys[index]]) {
                th.textContent = translations[paidKeys[index]];
              }
            });
          }
        }
      }
    });

    // Buttons übersetzen
    document.querySelectorAll('button').forEach(button => {
      if (button.textContent.includes('Details')) {
        button.textContent = translations['button.details'];
      } else if (button.textContent.includes('Bezahlen')) {
        button.textContent = translations['button.pay'];
      }
    });

    // Status Badges übersetzen
    document.querySelectorAll('.status-badge').forEach(badge => {
      const text = badge.textContent.trim();
      if (text.includes('Offen')) {
        badge.innerHTML = badge.innerHTML.replace(/Offen/, translations['status.open']);
      } else if (text.includes('Bezahlt')) {
        badge.innerHTML = badge.innerHTML.replace(/Bezahlt/, translations['status.paid']);
      } else if (text.includes('Überfällig')) {
        badge.innerHTML = badge.innerHTML.replace(/Überfällig/, translations['status.overdue']);
      }
    });

    // Zusammenfassung übersetzen
    const summary = document.querySelector('.invoice-summary');
    if (summary) {
      const h2 = summary.querySelector('h2');
      if (h2) {
        h2.textContent = translations['invoices.summary'];
      }

      const statLabels = summary.querySelectorAll('.stat-label');
      const summaryKeys = ['summary.total_activities', 'summary.total_amount', 'summary.paid_amount', 'summary.open_amount'];
      statLabels.forEach((label, index) => {
        if (summaryKeys[index] && translations[summaryKeys[index]]) {
          label.textContent = translations[summaryKeys[index]];
        }
      });
    }

    // "pro Aktivität" Text übersetzen
    document.querySelectorAll('small').forEach(small => {
      if (small.textContent.includes('pro Aktivität')) {
        small.innerHTML = small.innerHTML.replace(/pro Aktivität/, translations['per_activity']);
      }
    });

    // "Noch keine Rechnungen" Message übersetzen
    const noInvoicesMsg = document.querySelector('main p');
    if (noInvoicesMsg && noInvoicesMsg.textContent.includes('Noch keine Rechnungen')) {
      noInvoicesMsg.textContent = translations['invoices.no_invoices'];
    }
  }

  translateNavigation(translations) {
    // Footer Links übersetzen
    const footerLinks = document.querySelectorAll('footer a');
    footerLinks.forEach(link => {
      if (link.textContent.includes('Datenschutzerklärung')) {
        link.textContent = translations['footer.datenschutz'];
      } else if (link.textContent.includes('Impressum')) {
        link.textContent = translations['footer.impressum'];
      }
    });
  }

  // Globale Funktionen für Rechnung.js
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

// Export für rechnung.js
window.getTranslation = function(key) {
  return languageSwitcher ? languageSwitcher.getTranslation(key) : key;
};

window.getCurrentLanguage = function() {
  return languageSwitcher ? languageSwitcher.getCurrentLanguage() : 'de';
};
