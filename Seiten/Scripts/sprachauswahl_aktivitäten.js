

// Sprachdefinitionen für die Aktivitäten-Seite
const aktivitaetenLanguages = {
    de: {
        // Header & Navigation
        bills: "Rechnungen",
        logout: "Ausloggen",
        account: "Konto",
        
        // Main Title
        editActivities: "Begleitprotokoll",
        
        // Context Menu
        edit: "🛠️ Bearbeiten",
        delete: "🗑️ Löschen",
        
        // Modal
        editActivity: "Begleitprotokoll",
        activityName: "Name des Protokolls: ",
        activityStart: "Beginn des Termins:",
        activityEnd: "Ende des Termins: ",
        note: "Notiz :",
        done: "Fertig",
        cancel: "Abbrechen",
        
        // Form Sections - Details Summaries
        addNewActivity: "Neues Protokoll hinzufügen",
        editActivitySection: "🛠️ Protokoll bearbeiten",
        deleteActivitySection: "🗑️ Protokoll löschen",
        
        // Add Activity Form
        activityNameLabel: "Name",
        activityNamePlaceholder: "Name",
        activityStartLabel: "Begin",
        startPlaceholder: "Beginn",
        activityEndLabel: "Ende",
        notesLabel: "Notizen",
        notePlaceholder: "Notiz",
        addButton: "Hinzufügen",
        
        // Edit Activity Form
        indexPlaceholder: "Index",
        newNameLabel: "Neuer Name",
        newNamePlaceholder: "Neuer Name",
        changeStartLabel: "Beginn des Protokolls ändern",
        changeEndLabel: "Ende des Protokolls ändern",
        changeNoteLabel: "Notitz ändern",
        changeNotePlaceholder: "Notiz ändern",
        saveChanges: "Änderungen speichern",
        
        // Delete Activity Form
        indexDeletePlaceholder: "Index",
        deleteButton: "Löschen",
        clearAllButton: "🪜 Alles löschen",
        
        // Table Section
        activitiesTable: "📋 Begleitprotokolle",
        tableHeaders: {
            index: "Datum",
            activity: "Name des Protokolls",
            start: "Beginn",
            end: "Ende",
            note: "Notiz"
        },
        
        // Confirmation Dialog
        confirmDeleteAll: "⚠️ Wollen Sie wirklich ALLE Begleitprotokolle unwiderruflich löschen? ⚠️"
    },
    
    en: {
        // Header & Navigation
        bills: "Bills",
        logout: "Logout",
        account: "Account",
        
        // Main Title
        editActivities: "🗓️ Edit",
        
        // Context Menu
        edit: "🛠️ Edit",
        delete: "🗑️ Delete",
        
        // Modal
        editActivity: "🛠️ Edit Activity",
        activityName: "Activity Name:",
        activityStart: "Activity Start:",
        activityEnd: "Activity End:",
        note: "Note :",
        done: "Done",
        cancel: "Cancel",
        
        // Form Sections - Details Summaries
        addNewActivity: "➕ Add New Activity",
        editActivitySection: "🛠️ Edit Activity",
        deleteActivitySection: "🗑️ Delete Activity",
        
        // Add Activity Form
        activityNameLabel: "Activity Name",
        activityNamePlaceholder: "Activity Name",
        activityStartLabel: "Activity Start",
        startPlaceholder: "Start",
        activityEndLabel: "Activity End",
        notesLabel: "Notes",
        notePlaceholder: "Note",
        addButton: "Add",
        
        // Edit Activity Form
        indexPlaceholder: "Index",
        newNameLabel: "New Name",
        newNamePlaceholder: "New Name",
        changeStartLabel: "Change Activity Start",
        changeEndLabel: "Change Activity End",
        changeNoteLabel: "Change Note",
        changeNotePlaceholder: "Change Note",
        saveChanges: "Save Changes",
        
        // Delete Activity Form
        indexDeletePlaceholder: "Index",
        deleteButton: "Delete",
        clearAllButton: "🪜 Clear All",
        
        // Table Section
        activitiesTable: "📋 Activities Table",
        tableHeaders: {
            index: "#",
            activity: "Activity",
            start: "Start",
            end: "End",
            note: "Note"
        },
        
        // Confirmation Dialog
        confirmDeleteAll: "⚠️ Do you really want to permanently delete ALL activities? ⚠️"
    }
};

// Aktuelle Sprache (Standard: Deutsch)
let currentAktivitaetenLanguage = localStorage.getItem('mediassist-aktivitaeten-language') || 'de';

/**
 * Initialisiert die Sprachauswahl beim Laden der Seite
 */
function initializeAktivitaetenLanguageSwitcher() {
    // Sprache aus localStorage laden
    currentAktivitaetenLanguage = localStorage.getItem('mediassist-aktivitaeten-language') || 'de';
    
    // Dropdown-Funktionalität implementieren
    setupAktivitaetenLanguageDropdown();
    
    // Seite mit aktueller Sprache initialisieren
    updateAktivitaetenPageLanguage();
    
    // Button-Text aktualisieren
    updateAktivitaetenLanguageButton();
}

/**
 * Richtet das Sprachauswahl-Dropdown ein
 */
function setupAktivitaetenLanguageDropdown() {
    const langButton = document.getElementById('lang-button');
    const langDropdown = document.getElementById('lang-dropdown');
    
    if (!langButton || !langDropdown) return;
    
    // Dropdown Toggle
    langButton.addEventListener('click', function(e) {
        e.stopPropagation();
        const isOpen = langDropdown.style.display === 'block';
        
        if (isOpen) {
            closeAktivitaetenLanguageDropdown();
        } else {
            openAktivitaetenLanguageDropdown();
        }
    });
    
    // Sprachauswahl-Event Listener
    const langItems = langDropdown.querySelectorAll('[data-lang]');
    langItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.stopPropagation();
            const selectedLang = this.getAttribute('data-lang');
            switchAktivitaetenLanguage(selectedLang);
            closeAktivitaetenLanguageDropdown();
        });
        
        // Keyboard navigation
        item.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const selectedLang = this.getAttribute('data-lang');
                switchAktivitaetenLanguage(selectedLang);
                closeAktivitaetenLanguageDropdown();
            }
        });
    });
    
    // Dropdown schließen bei Klick außerhalb
    document.addEventListener('click', function(e) {
        if (!langButton.contains(e.target) && !langDropdown.contains(e.target)) {
            closeAktivitaetenLanguageDropdown();
        }
    });
    
    // ESC-Taste zum Schließen
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeAktivitaetenLanguageDropdown();
        }
    });
}

/**
 * Öffnet das Sprachauswahl-Dropdown
 */
function openAktivitaetenLanguageDropdown() {
    const langButton = document.getElementById('lang-button');
    const langDropdown = document.getElementById('lang-dropdown');
    
    if (langButton && langDropdown) {
        langDropdown.style.display = 'block';
        langButton.setAttribute('aria-expanded', 'true');
        langDropdown.setAttribute('aria-hidden', 'false');
        
        // Fokus auf erste Option setzen
        const firstItem = langDropdown.querySelector('[data-lang]');
        if (firstItem) {
            firstItem.focus();
        }
    }
}

/**
 * Schließt das Sprachauswahl-Dropdown
 */
function closeAktivitaetenLanguageDropdown() {
    const langButton = document.getElementById('lang-button');
    const langDropdown = document.getElementById('lang-dropdown');
    
    if (langButton && langDropdown) {
        langDropdown.style.display = 'none';
        langButton.setAttribute('aria-expanded', 'false');
        langDropdown.setAttribute('aria-hidden', 'true');
    }
}

/**
 * Wechselt die Sprache und aktualisiert die Seite
 * @param {string} languageCode - Der Sprachcode (de, en)
 */
function switchAktivitaetenLanguage(languageCode) {
    if (aktivitaetenLanguages[languageCode]) {
        currentAktivitaetenLanguage = languageCode;
        localStorage.setItem('mediassist-aktivitaeten-language', languageCode);
        updateAktivitaetenPageLanguage();
        updateAktivitaetenLanguageButton();
    }
}

/**
 * Aktualisiert den Sprachauswahl-Button
 */
function updateAktivitaetenLanguageButton() {
    const langButton = document.getElementById('lang-button');
    if (langButton) {
        const arrow = langButton.querySelector('.arrow');
        const arrowText = arrow ? arrow.outerHTML : '<span class="arrow">▾</span>';
        langButton.innerHTML = currentAktivitaetenLanguage.toUpperCase() + ' ' + arrowText;
    }
}

/**
 * Aktualisiert alle Textelemente auf der Seite mit der gewählten Sprache
 */
function updateAktivitaetenPageLanguage() {
    const lang = aktivitaetenLanguages[currentAktivitaetenLanguage];
    
    // Header & Navigation
    const billsLink = document.querySelector('a[href="../html/rechnung.html"]');
    if (billsLink) billsLink.textContent = lang.bills;
    
    const logoutLink = document.querySelector('a[href="../Login_Registrieren.html"]');
    if (logoutLink) logoutLink.textContent = lang.logout;
    
    const loginIcon = document.getElementById('login-icon');
    if (loginIcon) loginIcon.title = lang.account;
    
    // Main Title
    const mainTitle = document.querySelector('h1');
    if (mainTitle) mainTitle.textContent = lang.editActivities;
    
    // Context Menu
    const editButton = document.getElementById('edit-button');
    if (editButton) editButton.textContent = lang.edit;
    
    const deleteButton = document.getElementById('delete-button');
    if (deleteButton) deleteButton.textContent = lang.delete;
    
    // Modal
    const modalTitle = document.querySelector('.modal h2');
    if (modalTitle) modalTitle.textContent = lang.editActivity;
    
    const modalLabels = {
        'modal-name': lang.activityName,
        'modal-beginn': lang.activityStart,
        'modal-ende': lang.activityEnd,
        'modal-Notiz': lang.note
    };
    
    Object.entries(modalLabels).forEach(([id, text]) => {
        const label = document.querySelector(`label[for="${id}"]`);
        if (label) label.textContent = text;
    });
    
    const modalSave = document.getElementById('modal-save');
    if (modalSave) modalSave.textContent = lang.done;
    
    const modalCancel = document.getElementById('modal-cancel');
    if (modalCancel) modalCancel.textContent = lang.cancel;
    
    // Details Summaries
    const summaries = document.querySelectorAll('summary');
    if (summaries[0]) summaries[0].textContent = lang.addNewActivity;
    if (summaries[1]) summaries[1].textContent = lang.editActivitySection;
    if (summaries[2]) summaries[2].textContent = lang.deleteActivitySection;
    
    // Add Activity Form
    const addFormLabels = document.querySelectorAll('.form-section details:first-child p');
    if (addFormLabels[0]) addFormLabels[0].textContent = lang.activityNameLabel;
    if (addFormLabels[1]) addFormLabels[1].textContent = lang.activityStartLabel;
    if (addFormLabels[2]) addFormLabels[2].textContent = lang.activityEndLabel;
    if (addFormLabels[3]) addFormLabels[3].textContent = lang.notesLabel;
    
    // Input Placeholders
    const nameDerAktivitaet = document.getElementById('nameDerAktivität');
    if (nameDerAktivitaet) nameDerAktivitaet.placeholder = lang.activityNamePlaceholder;
    
    const beginnInput = document.getElementById('beginn');
    if (beginnInput) beginnInput.placeholder = lang.startPlaceholder;
    
    const notitzInput = document.getElementById('notitz');
    if (notitzInput) notitzInput.placeholder = lang.notePlaceholder;
    
    // Edit Activity Form
    const editFormLabels = document.querySelectorAll('.form-section details:nth-child(2) p');
    if (editFormLabels[0]) editFormLabels[0].textContent = lang.newNameLabel;
    if (editFormLabels[1]) editFormLabels[1].textContent = lang.changeStartLabel;
    if (editFormLabels[2]) editFormLabels[2].textContent = lang.changeEndLabel;
    if (editFormLabels[3]) editFormLabels[3].textContent = lang.changeNoteLabel;
    
    const indexInput = document.getElementById('index');
    if (indexInput) indexInput.placeholder = lang.indexPlaceholder;
    
    const neuerNameInput = document.getElementById('neuerNameDerAktivität');
    if (neuerNameInput) neuerNameInput.placeholder = lang.newNamePlaceholder;
    
    const notitzAendernInput = document.getElementById('notitzÄndern');
    if (notitzAendernInput) notitzAendernInput.placeholder = lang.changeNotePlaceholder;
    
    const indexLoeschenInput = document.getElementById('indexLoeschen');
    if (indexLoeschenInput) indexLoeschenInput.placeholder = lang.indexDeletePlaceholder;
    
    // Buttons
    const addButton = document.querySelector('.form-section details:first-child button');
    if (addButton) addButton.textContent = lang.addButton;
    
    const saveChangesButton = document.querySelector('.form-section details:nth-child(2) button');
    if (saveChangesButton) saveChangesButton.textContent = lang.saveChanges;
    
    const deleteButtons = document.querySelectorAll('.form-section details:nth-child(3) button');
    if (deleteButtons[0]) deleteButtons[0].textContent = lang.deleteButton;
    if (deleteButtons[1]) deleteButtons[1].textContent = lang.clearAllButton;
    
    // Table Section
    const tableTitle = document.querySelector('.tabelle-section h2');
    if (tableTitle) tableTitle.textContent = lang.activitiesTable;
    
    // Table Headers
    const tableHeaders = document.querySelectorAll('#aktivitätenTabelle thead th');
    const headerTexts = [
        lang.tableHeaders.index,
        lang.tableHeaders.activity,
        lang.tableHeaders.start,
        lang.tableHeaders.end,
        lang.tableHeaders.note
    ];
    
    tableHeaders.forEach((header, index) => {
        if (headerTexts[index]) {
            header.textContent = headerTexts[index];
        }
    });
    
    // Update confirm dialog text in the onclick attribute
    const clearAllBtn = document.querySelector('button[onclick*="confirm"]');
    if (clearAllBtn) {
        const onclickAttr = clearAllBtn.getAttribute('onclick');
        const newOnclickAttr = onclickAttr.replace(
            /confirm\('.*?'\)/,
            `confirm('${lang.confirmDeleteAll}')`
        );
        clearAllBtn.setAttribute('onclick', newOnclickAttr);
    }
}

/**
 * Gibt die aktuelle Sprache zurück
 * @returns {string} Der aktuelle Sprachcode
 */
function getCurrentAktivitaetenLanguage() {
    return currentAktivitaetenLanguage;
}

/**
 * Gibt den übersetzten Text für einen gegebenen Schlüssel zurück
 * @param {string} key - Der Übersetzungsschlüssel
 * @returns {string} Der übersetzte Text
 */
function getAktivitaetenTranslation(key) {
    return aktivitaetenLanguages[currentAktivitaetenLanguage][key] || key;
}

/**
 * Hilfsfunktion für übersetzte Confirm-Dialoge
 * @param {string} messageKey - Der Schlüssel für die Nachricht
 * @returns {boolean} Das Ergebnis des Confirm-Dialogs
 */
function confirmTranslated(messageKey) {
    const message = getAktivitaetenTranslation(messageKey);
    return confirm(message);
}

// Initialisierung beim Laden der Seite
document.addEventListener('DOMContentLoaded', function() {
    initializeAktivitaetenLanguageSwitcher();
});

// Export für andere Skripte
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        switchAktivitaetenLanguage,
        getCurrentAktivitaetenLanguage,
        getAktivitaetenTranslation,
        confirmTranslated
    };
}
