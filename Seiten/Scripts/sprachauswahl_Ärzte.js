 
//Sprachauswahl-Funktionalität für MediAssist Ärzte-Verwaltung
 
 

// Sprachdefinitionen für die Ärzte-Seite
const arztLanguages = {
    de: {
        // Header & Navigation
        backToPatients: "← Zurück zur Patientenliste",
        manageDoctor: "Ärzte verwalten",
        patient: "Patient:",
        bills: "Rechnungen",
        logout: "Ausloggen",
        account: "Konto",
        
        // Context Menu
        edit: "🛠️ Bearbeiten",
        delete: "🗑️ Löschen",
        
        // Modal
        editDoctorData: "🛠️ Arztdaten bearbeiten",
        doctorName: "Arztname:",
        specialty: "Fach:",
        email: "eMail:",
        phoneNumber: "Telefonnummer:",
        address: "Adresse:",
        done: "Fertig",
        cancel: "Abbrechen",
        
        // Form Section
        addNewDoctor: "➕ Neuer Arzt hinzufügen",
        doctorNamePlaceholder: "Arztname",
        specialtyPlaceholder: "Fach",
        emailPlaceholder: "E-Mail",
        phonePlaceholder: "Telefonnummer",
        addressPlaceholder: "Adresse",
        addButton: "Hinzufügen",
        
        editDoctorDataSection: "🛠️ Arztdaten bearbeiten",
        selectIndex: "Index auswählen:",
        newDoctorNamePlaceholder: "Neuer Arztname",
        newSpecialtyPlaceholder: "Neue Fach",
        newEmailPlaceholder: "Neue E-Mail",
        newPhonePlaceholder: "Neue Telefonnummer",
        newAddressPlaceholder: "Neue Adresse",
        saveChanges: "Änderungen speichern",
        
        deleteDoctorSection: "🗑️ Arzt löschen",
        selectIndexDelete: "Index auswählen:",
        deleteButton: "Löschen",
        clearAll: "🧹 Alles löschen",
        
        // Table Section
        doctorsList: "📄 Ärzte Liste",
        tableHeaders: {
            index: "#",
            name: "Name",
            specialty: "Fach",
            email: "E-Mail",
            phone: "Telefon",
            address: "Adresse"
        }
    },
    
    en: {
        // Header & Navigation
        backToPatients: "← Back to Patient List",
        manageDoctor: "Manage Doctors",
        patient: "Patient:",
        bills: "Bills",
        logout: "Logout",
        account: "Account",
        
        // Context Menu
        edit: "🛠️ Edit",
        delete: "🗑️ Delete",
        
        // Modal
        editDoctorData: "🛠️ Edit Doctor Data",
        doctorName: "Doctor Name:",
        specialty: "Specialty:",
        email: "Email:",
        phoneNumber: "Phone Number:",
        address: "Address:",
        done: "Done",
        cancel: "Cancel",
        
        // Form Section
        addNewDoctor: "➕ Add New Doctor",
        doctorNamePlaceholder: "Doctor Name",
        specialtyPlaceholder: "Specialty",
        emailPlaceholder: "Email",
        phonePlaceholder: "Phone Number",
        addressPlaceholder: "Address",
        addButton: "Add",
        
        editDoctorDataSection: "🛠️ Edit Doctor Data",
        selectIndex: "Select Index:",
        newDoctorNamePlaceholder: "New Doctor Name",
        newSpecialtyPlaceholder: "New Specialty",
        newEmailPlaceholder: "New Email",
        newPhonePlaceholder: "New Phone Number",
        newAddressPlaceholder: "New Address",
        saveChanges: "Save Changes",
        
        deleteDoctorSection: "🗑️ Delete Doctor",
        selectIndexDelete: "Select Index:",
        deleteButton: "Delete",
        clearAll: "🧹 Clear All",
        
        // Table Section
        doctorsList: "📄 Doctors List",
        tableHeaders: {
            index: "#",
            name: "Name",
            specialty: "Specialty",
            email: "Email",
            phone: "Phone",
            address: "Address"
        }
    }
};

// Aktuelle Sprache (Standard: Deutsch)
let currentArztLanguage = localStorage.getItem('mediassist-aerzte-language') || 'de';

/**
 * Initialisiert die Sprachauswahl beim Laden der Seite
 */
function initializeArztLanguageSwitcher() {
    // Sprache aus localStorage laden
    currentArztLanguage = localStorage.getItem('mediassist-aerzte-language') || 'de';
    
    // Dropdown-Funktionalität implementieren
    setupLanguageDropdown();
    
    // Seite mit aktueller Sprache initialisieren
    updateArztPageLanguage();
    
    // Button-Text aktualisieren
    updateLanguageButton();
}

/**
 * Richtet das Sprachauswahl-Dropdown ein
 */
function setupLanguageDropdown() {
    const langButton = document.getElementById('lang-button');
    const langDropdown = document.getElementById('lang-dropdown');
    
    if (!langButton || !langDropdown) return;
    
    // Dropdown Toggle
    langButton.addEventListener('click', function(e) {
        e.stopPropagation();
        const isOpen = langDropdown.style.display === 'block';
        
        if (isOpen) {
            closeLanguageDropdown();
        } else {
            openLanguageDropdown();
        }
    });
    
    // Sprachauswahl-Event Listener
    const langItems = langDropdown.querySelectorAll('[data-lang]');
    langItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.stopPropagation();
            const selectedLang = this.getAttribute('data-lang');
            switchArztLanguage(selectedLang);
            closeLanguageDropdown();
        });
        
        // Keyboard navigation
        item.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const selectedLang = this.getAttribute('data-lang');
                switchArztLanguage(selectedLang);
                closeLanguageDropdown();
            }
        });
    });
    
    // Dropdown schließen bei Klick außerhalb
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
}

/**
 * Öffnet das Sprachauswahl-Dropdown
 */
function openLanguageDropdown() {
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
function closeLanguageDropdown() {
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
function switchArztLanguage(languageCode) {
    if (arztLanguages[languageCode]) {
        currentArztLanguage = languageCode;
        localStorage.setItem('mediassist-aerzte-language', languageCode);
        updateArztPageLanguage();
        updateLanguageButton();
    }
}

/**
 * Aktualisiert den Sprachauswahl-Button
 */
function updateLanguageButton() {
    const langButton = document.getElementById('lang-button');
    if (langButton) {
        const arrow = langButton.querySelector('.arrow');
        const arrowText = arrow ? arrow.outerHTML : '<span class="arrow">▾</span>';
        langButton.innerHTML = currentArztLanguage.toUpperCase() + ' ' + arrowText;
    }
}

/**
 * Aktualisiert alle Textelemente auf der Seite mit der gewählten Sprache
 */
function updateArztPageLanguage() {
    const lang = arztLanguages[currentArztLanguage];
    
    // Navigation & Header
    const backLink = document.querySelector('.back-link');
    if (backLink) backLink.innerHTML = lang.backToPatients;
    
    const mainTitle = document.querySelector('main h1');
    if (mainTitle) mainTitle.textContent = lang.manageDoctor;
    
    // Login Menu
    const billsLink = document.querySelector('a[href="../html/rechnung.html"]');
    if (billsLink) billsLink.textContent = lang.bills;
    
    const logoutLink = document.querySelector('a[href="../html/Login_Registrieren.html"]');
    if (logoutLink) logoutLink.textContent = lang.logout;
    
    const loginIcon = document.getElementById('login-icon');
    if (loginIcon) loginIcon.title = lang.account;
    
    // Context Menu
    const editButton = document.getElementById('edit-button');
    if (editButton) editButton.textContent = lang.edit;
    
    const deleteButton = document.getElementById('delete-button');
    if (deleteButton) deleteButton.textContent = lang.delete;
    
    // Modal
    const modalTitle = document.querySelector('.modal h2');
    if (modalTitle) modalTitle.textContent = lang.editDoctorData;
    
    const modalLabels = {
        'modal-arzt-name': lang.doctorName,
        'modal-arzt-fach': lang.specialty,
        'modal-arzt-email': lang.email,
        'modal-arzt-telefon': lang.phoneNumber,
        'modal-arzt-adresse': lang.address
    };
    
    Object.entries(modalLabels).forEach(([id, text]) => {
        const label = document.querySelector(`label[for="${id}"]`);
        if (label) label.textContent = text;
    });
    
    const modalSave = document.getElementById('modal-save');
    if (modalSave) modalSave.textContent = lang.done;
    
    const modalCancel = document.getElementById('modal-cancel');
    if (modalCancel) modalCancel.textContent = lang.cancel;
    
    // Form Section
    const formTitles = document.querySelectorAll('.form-section h2');
    if (formTitles[0]) formTitles[0].textContent = lang.addNewDoctor;
    if (formTitles[1]) formTitles[1].textContent = lang.editDoctorDataSection;
    if (formTitles[2]) formTitles[2].textContent = lang.deleteDoctorSection;
    
    // Input Placeholders
    const placeholders = {
        'arztname': lang.doctorNamePlaceholder,
        'fach': lang.specialtyPlaceholder,
        'eMail': lang.emailPlaceholder,
        'Telefonnummer': lang.phonePlaceholder,
        'Adresse': lang.addressPlaceholder,
        'neuerArztname': lang.newDoctorNamePlaceholder,
        'neueFach': lang.newSpecialtyPlaceholder,
        'neueEMail': lang.newEmailPlaceholder,
        'neueTelefonnummer': lang.newPhonePlaceholder,
        'neueAdresse': lang.newAddressPlaceholder
    };
    
    Object.entries(placeholders).forEach(([id, text]) => {
        const input = document.getElementById(id);
        if (input) input.placeholder = text;
    });
    
    // Buttons
    const addButton = document.getElementById('add-med');
    if (addButton) addButton.textContent = lang.addButton;
    
    const editButton2 = document.getElementById('edit-med');
    if (editButton2) editButton2.textContent = lang.saveChanges;
    
    const deleteArztButton = document.getElementById('delete-arzt');
    if (deleteArztButton) deleteArztButton.textContent = lang.deleteButton;
    
    const clearButton = document.getElementById('clear-med');
    if (clearButton) clearButton.textContent = lang.clearAll;
    
    // Labels
    const indexLabels = document.querySelectorAll('label[for="indexDropdown"], label[for="indexLoeschenDropdown"]');
    if (indexLabels[0]) indexLabels[0].textContent = lang.selectIndex;
    if (indexLabels[1]) indexLabels[1].textContent = lang.selectIndexDelete;
    
    // Table Section
    const tableTitle = document.querySelector('.tabelle-section h2');
    if (tableTitle) tableTitle.textContent = lang.doctorsList;
    
    // Table Headers
    const tableHeaders = document.querySelectorAll('#arztTabelle thead th');
    const headerTexts = [
        lang.tableHeaders.index,
        lang.tableHeaders.name,
        lang.tableHeaders.specialty,
        lang.tableHeaders.email,
        lang.tableHeaders.phone,
        lang.tableHeaders.address
    ];
    
    tableHeaders.forEach((header, index) => {
        if (headerTexts[index]) {
            header.textContent = headerTexts[index];
        }
    });
}

/**
 * Gibt die aktuelle Sprache zurück
 * @returns {string} Der aktuelle Sprachcode
 */
function getCurrentArztLanguage() {
    return currentArztLanguage;
}

/**
 * Gibt den übersetzten Text für einen gegebenen Schlüssel zurück
 * @param {string} key - Der Übersetzungsschlüssel
 * @returns {string} Der übersetzte Text
 */
function getArztTranslation(key) {
    return arztLanguages[currentArztLanguage][key] || key;
}

// Initialisierung beim Laden der Seite
document.addEventListener('DOMContentLoaded', function() {
    initializeArztLanguageSwitcher();
});

// Export für andere Skripte
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        switchArztLanguage,
        getCurrentArztLanguage,
        getArztTranslation
    };
}
