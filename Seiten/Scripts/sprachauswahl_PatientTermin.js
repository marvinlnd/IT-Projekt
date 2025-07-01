/*Sprachauswahl für die Seite PateientTermin*/

class LanguageSwitcher {
    constructor() {
        this.currentLang = 'de'; // Standard: Deutsch
        this.langButton = document.getElementById('lang-button');
        this.langDropdown = document.getElementById('lang-dropdown');
        this.translations = this.initTranslations();
        
        this.init();
    }

    init() {
        // Event Listeners hinzufügen
        this.langButton.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleDropdown();
        });

        // Dropdown-Einträge Event Listener
        this.langDropdown.querySelectorAll('[data-lang]').forEach(item => {
            item.addEventListener('click', (e) => {
                const selectedLang = e.target.getAttribute('data-lang');
                this.switchLanguage(selectedLang);
            });
        });

        // Schließe Dropdown bei Klick außerhalb
        document.addEventListener('click', () => {
            this.closeDropdown();
        });

        // Lade gespeicherte Sprache aus localStorage
        this.loadSavedLanguage();
    }

    initTranslations() {
        return {
            de: {
                // Header und Navigation
                accountTitle: "Konto",
                bills: "Rechnungen",
                logout: "Ausloggen",
                
                // Hauptinhalt
                backToPatients: "Zurück zur Patientenliste",
                appointmentsOf: "Termine von",
                searchPlaceholder: "Termin suchen…",
                searchLabel: "Suche",
                addNewAppointment: "Neuen Termin hinzufügen",
                
                // Tabelle
                titleColumn: "Titel",
                dateTimeColumn: "Datum & Uhrzeit",
                actionsColumn: "Aktionen",
                
                // Modal
                appointmentModal: "Termin",
                titleLabel: "Titel:",
                dateTimeLabel: "Datum & Uhrzeit:",
                cancelButton: "Abbrechen",
                saveButton: "Speichern",
                
                // Aktionen
                edit: "Bearbeiten",
                delete: "Löschen"
            },
            en: {
                // Header und Navigation
                accountTitle: "Account",
                bills: "Bills",
                logout: "Logout",
                
                // Hauptinhalt
                backToPatients: "Back to Patient List",
                appointmentsOf: "Appointments of",
                searchPlaceholder: "Search appointment…",
                searchLabel: "Search",
                addNewAppointment: "Add New Appointment",
                
                // Tabelle
                titleColumn: "Title",
                dateTimeColumn: "Date & Time",
                actionsColumn: "Actions",
                
                // Modal
                appointmentModal: "Appointment",
                titleLabel: "Title:",
                dateTimeLabel: "Date & Time:",
                cancelButton: "Cancel",
                saveButton: "Save",
                
                // Aktionen
                edit: "Edit",
                delete: "Delete"
            }
        };
    }

    toggleDropdown() {
        const isExpanded = this.langButton.getAttribute('aria-expanded') === 'true';
        
        if (isExpanded) {
            this.closeDropdown();
        } else {
            this.openDropdown();
        }
    }

    openDropdown() {
        this.langButton.setAttribute('aria-expanded', 'true');
        this.langDropdown.style.display = 'block';
        this.langDropdown.setAttribute('aria-hidden', 'false');
    }

    closeDropdown() {
        this.langButton.setAttribute('aria-expanded', 'false');
        this.langDropdown.style.display = 'none';
        this.langDropdown.setAttribute('aria-hidden', 'true');
    }

    switchLanguage(lang) {
        if (lang === this.currentLang) {
            this.closeDropdown();
            return;
        }

        this.currentLang = lang;
        this.updateButtonText();
        this.updatePageTexts();
        this.saveLanguage();
        this.closeDropdown();
    }

    updateButtonText() {
        const arrow = this.langButton.querySelector('.arrow');
        this.langButton.innerHTML = `${this.currentLang.toUpperCase()} <span class="arrow">▾</span>`;
    }

    updatePageTexts() {
        const texts = this.translations[this.currentLang];

        // Header und Navigation
        const loginIcon = document.getElementById('login-icon');
        if (loginIcon) {
            loginIcon.setAttribute('title', texts.accountTitle);
        }

        // Navigation Links
        const billsLink = document.querySelector('a[href="../html/rechnung.html"]');
        if (billsLink) billsLink.textContent = texts.bills;

        const logoutLink = document.querySelector('a[href="../index.html"]');
        if (logoutLink) logoutLink.textContent = texts.logout;

        // Hauptinhalt
        const backLink = document.querySelector('.back-link');
        if (backLink) backLink.innerHTML = `&larr; ${texts.backToPatients}`;

        const appointmentsTitle = document.querySelector('.termine-list h2');
        if (appointmentsTitle) {
            const patientName = document.getElementById('patient-name');
            const patientNameText = patientName ? patientName.textContent : '…';
            appointmentsTitle.innerHTML = `${texts.appointmentsOf} <span id="patient-name">${patientNameText}</span>`;
        }

        // Suchfeld
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.setAttribute('placeholder', texts.searchPlaceholder);
        }

        const searchButton = document.getElementById('search-button');
        if (searchButton) {
            searchButton.setAttribute('aria-label', texts.searchLabel);
        }

        // Button
        const addButton = document.getElementById('add-termin');
        if (addButton) addButton.textContent = texts.addNewAppointment;

        // Tabellenkopf
        const tableHeaders = document.querySelectorAll('#termin-table thead th');
        if (tableHeaders.length >= 3) {
            tableHeaders[0].textContent = texts.titleColumn;
            tableHeaders[1].textContent = texts.dateTimeColumn;
            tableHeaders[2].textContent = texts.actionsColumn;
        }

        // Modal
        const modalTitle = document.getElementById('modal-title');
        if (modalTitle) modalTitle.textContent = texts.appointmentModal;

        const titleLabel = document.querySelector('label[for="evt-title"]');
        if (titleLabel) titleLabel.textContent = texts.titleLabel;

        const dateLabel = document.querySelector('label[for="evt-start"]');
        if (dateLabel) dateLabel.textContent = texts.dateTimeLabel;

        const cancelBtn = document.getElementById('cancel-btn');
        if (cancelBtn) cancelBtn.textContent = texts.cancelButton;

        const saveBtn = document.querySelector('button[type="submit"].save');
        if (saveBtn) saveBtn.textContent = texts.saveButton;

        // Aktualisiere bereits geladene Aktions-Buttons in der Tabelle
        this.updateActionButtons();
    }

    updateActionButtons() {
        const texts = this.translations[this.currentLang];
        
        // Suche nach Edit/Delete Buttons in der Tabelle
        const editButtons = document.querySelectorAll('.edit-btn, button[onclick*="edit"]');
        editButtons.forEach(btn => {
            if (btn.textContent.trim() === 'Bearbeiten' || btn.textContent.trim() === 'Edit') {
                btn.textContent = texts.edit;
            }
        });

        const deleteButtons = document.querySelectorAll('.delete-btn, button[onclick*="delete"]');
        deleteButtons.forEach(btn => {
            if (btn.textContent.trim() === 'Löschen' || btn.textContent.trim() === 'Delete') {
                btn.textContent = texts.delete;
            }
        });
    }

    saveLanguage() {
        localStorage.setItem('mediassist-language', this.currentLang);
    }

    loadSavedLanguage() {
        const savedLang = localStorage.getItem('mediassist-language');
        if (savedLang && this.translations[savedLang]) {
            this.switchLanguage(savedLang);
        }
    }

    // Öffentliche Methode für andere Scripts, um Aktions-Buttons zu aktualisieren
    refreshActionButtons() {
        this.updateActionButtons();
    }

    // Getter für aktuelle Sprache
    getCurrentLanguage() {
        return this.currentLang;
    }

    // Getter für Übersetzungen (für andere Scripts)
    getTranslations(key = null) {
        const currentTexts = this.translations[this.currentLang];
        return key ? currentTexts[key] : currentTexts;
    }
}

// Initialisierung nach DOM-Laden
document.addEventListener('DOMContentLoaded', () => {
    // Erstelle globale Instanz für andere Scripts
    window.languageSwitcher = new LanguageSwitcher();
});

// Export für Modulverwendung (falls benötigt)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LanguageSwitcher;
}
