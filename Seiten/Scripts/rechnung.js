 // ============================
// Automatische Rechnungserstellung für alle Activities
// ============================

// Login Menu
const loginIcon = document.getElementById('login-icon');
const loginMenu = document.getElementById('login-menu');

if (loginIcon && loginMenu) {
  loginIcon.addEventListener('click', e => {
    e.stopPropagation();
    const isOpen = loginMenu.classList.toggle('open');
    loginMenu.setAttribute('aria-hidden', !isOpen);
    loginIcon.setAttribute('aria-expanded', isOpen);
  });

  document.addEventListener('click', e => {
    if (!loginIcon.contains(e.target) && !loginMenu.contains(e.target)) {
      loginMenu.classList.remove('open');
      loginMenu.setAttribute('aria-hidden', 'true');
      loginIcon.setAttribute('aria-expanded', 'false');
    }
  });
}

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyAakpWbT87pJ4Bv1Xr0Mk2lCNhNols7KR4",
  authDomain: "it-projekt-ffc4d.firebaseapp.com",
  projectId: "it-projekt-ffc4d",
  storageBucket: "it-projekt-ffc4d.appspot.com",
  messagingSenderId: "534546734981",
  appId: "1:534546734981:web:13bffd7c78893bd0e3aeec"
};

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Globale Variablen
let invoiceData = [];
let activitiesListener = null;
let currentUserId = null;
let processedActivities = new Set();
const invoicesList = document.querySelector('.invoices');
const standardPreis = 1.00;

const statusConfig = {
  'bezahlt': { class: 'status-paid', icon: '✓', text: 'Bezahlt', color: '#28a745' },
  'offen': { class: 'status-open', icon: '○', text: 'Offen', color: '#ffc107' },
  'überfällig': { class: 'status-overdue', icon: '!', text: 'Überfällig', color: '#dc3545' }
};

// Utility Functions
const formatCurrency = amount => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);
const formatDate = dateString => dateString ? new Date(dateString).toLocaleDateString('de-DE') : 'Nicht verfügbar';

// Sichere Alert/Confirm Funktionen
const safeAlert = (message) => {
  try {
    if (window.alert && typeof window.alert === 'function') {
      window.alert(message);
    }
  } catch (e) {
    // Fehler ignorieren
  }
};

const safeConfirm = (message) => {
  try {
    if (window.confirm && typeof window.confirm === 'function') {
      return window.confirm(message);
    } else {
      return true;
    }
  } catch (e) {
    return true;
  }
};

const parseFirestoreDate = date => {
  if (!date) return new Date();
  
  if (typeof date.toDate === 'function') {
    try {
      return date.toDate();
    } catch (e) {
      return new Date();
    }
  }
  
  try {
    const parsed = new Date(date);
    if (isNaN(parsed.getTime())) {
      return new Date();
    }
    return parsed;
  } catch (e) {
    return new Date();
  }
};

// Automatische Rechnungserstellung
function starteActivitiesUeberwachung(userId) {
  if (activitiesListener) activitiesListener();
  
  activitiesListener = db.collection("users").doc(userId).collection("aktivitäten").onSnapshot(async snapshot => {
    const changes = snapshot.docChanges();
    const newActivities = changes.filter(change => change.type === "added");
    const deletedActivities = changes.filter(change => change.type === "removed");
    
    for (const change of newActivities) {
      await verarbeiteActivity(change.doc.id, change.doc.data(), userId);
    }
    
    for (const change of deletedActivities) {
      await entferneActivityAusRechnungen(change.doc.id, userId);
    }
    
    if (newActivities.length > 0 || deletedActivities.length > 0) {
      await displayInvoices();
    }
  });
}

// Entfernt eine gelöschte Activity aus allen Rechnungen
async function entferneActivityAusRechnungen(activityId, userId) {
  try {
    const invoicesSnapshot = await db.collection("Invoices")
      .where("einrichtungsId", "==", userId)
      .get();
    
    for (const invoiceDoc of invoicesSnapshot.docs) {
      const invoiceData = invoiceDoc.data();
      const visits = invoiceData.visits || [];
      
      const visitIndex = visits.findIndex(visit => visit.activityId === activityId);
      
      if (visitIndex !== -1) {
        visits.splice(visitIndex, 1);
        
        if (visits.length === 0) {
          await invoiceDoc.ref.delete();
        } else {
          const newTotalAmount = visits.reduce((sum, visit) => sum + (visit.cost || standardPreis), 0);
          
          await invoiceDoc.ref.update({
            visits: visits,
            visitCount: visits.length,
            totalAmount: newTotalAmount,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
          });
        }
        
        processedActivities.delete(activityId);
        break;
      }
    }
  } catch (error) {
    // Fehler ignorieren
  }
}

// Bereinigt verwaiste Rechnungseinträge beim Start
async function bereinigeVerwaiseRechnungen(userId, existingActivityIds) {
  try {
    const invoicesSnapshot = await db.collection("Invoices")
      .where("einrichtungsId", "==", userId)
      .get();
    
    let bereinigtCount = 0;
    let geloeschtCount = 0;
    
    for (const invoiceDoc of invoicesSnapshot.docs) {
      const invoiceData = invoiceDoc.data();
      const visits = invoiceData.visits || [];
      
      const validVisits = visits.filter(visit => existingActivityIds.has(visit.activityId));
      
      if (validVisits.length === 0 && visits.length > 0) {
        await invoiceDoc.ref.delete();
        geloeschtCount++;
      } else if (validVisits.length !== visits.length) {
        const newTotalAmount = validVisits.reduce((sum, visit) => sum + (visit.cost || standardPreis), 0);
        
        await invoiceDoc.ref.update({
          visits: validVisits,
          visitCount: validVisits.length,
          totalAmount: newTotalAmount,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        bereinigtCount++;
      }
    }
    
    if (bereinigtCount > 0 || geloeschtCount > 0) {
      await displayInvoices();
    }
  } catch (error) {
    // Fehler ignorieren
  }
}

async function verarbeiteActivity(activityId, data, userId) {
  if (processedActivities.has(activityId)) return;
  
  const name = data.nameDerAktivität || data.name || '';
  if (!name.trim()) return;
  
  processedActivities.add(activityId);
  
  const datum = parseFirestoreDate(data.beginn || data.startDate);
  const year = datum.getFullYear();
  const month = datum.getMonth();
  const monthName = datum.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });
  
  const invoiceId = `R-${year}-${String(month + 1).padStart(2, '0')}`;
  const docId = `${invoiceId}_${userId}`;
  
  try {
    const invoiceRef = db.collection("Invoices").doc(docId);
    const doc = await invoiceRef.get();
    
    let rechnungsDaten;
    
    if (doc.exists) {
      rechnungsDaten = doc.data();
      
      const existingVisit = rechnungsDaten.visits?.find(v => v.activityId === activityId);
      if (existingVisit) {
        return;
      }
      
      if (rechnungsDaten.status === 'bezahlt') {
        const newInvoiceId = `${invoiceId}-NEU`;
        const newDocId = `${newInvoiceId}_${userId}`;
        const newInvoiceRef = db.collection("Invoices").doc(newDocId);
        
        rechnungsDaten = {
          invoiceId: newInvoiceId,
          month: monthName,
          year,
          monthNumber: month + 1,
          einrichtungsId: userId,
          visitCount: 0,
          totalAmount: 0,
          pricePerVisit: standardPreis,
          status: 'offen',
          dueDate: new Date(year, month + 1, 6).toISOString().split('T')[0],
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          visits: []
        };
        
        await verarbeiteActivityInRechnung(newInvoiceRef, rechnungsDaten, activityId, data);
        console.log(`✅ Rechnung ${newInvoiceId} erstellt`);
        return;
      }
    } else {
      rechnungsDaten = {
        invoiceId,
        month: monthName,
        year,
        monthNumber: month + 1,
        einrichtungsId: userId,
        visitCount: 0,
        totalAmount: 0,
        pricePerVisit: standardPreis,
        status: 'offen',
        dueDate: new Date(year, month + 1, 6).toISOString().split('T')[0],
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        visits: []
      };
    }
    
    await verarbeiteActivityInRechnung(invoiceRef, rechnungsDaten, activityId, data);
    console.log(`✅ Rechnung ${invoiceId} erstellt`);
  } catch (error) {
    // Fehler ignorieren
  }
}

async function verarbeiteActivityInRechnung(invoiceRef, rechnungsDaten, activityId, data) {
  if (!rechnungsDaten.visits) rechnungsDaten.visits = [];
  
  const datum = parseFirestoreDate(data.beginn || data.startDate);
  const now = new Date().toISOString();
  
  const newVisit = {
    activityId,
    date: datum.toISOString().split('T')[0],
    patient: data.patient || data.patients || "Unbekannt",
    doctor: data.notitz || data.notiz || "Keine Notiz",
    type: data.nameDerAktivität || data.name || '',
    cost: parseFloat(data.kosten || data.cost || standardPreis),
    addedAt: now
  };
  
  rechnungsDaten.visits.push(newVisit);
  rechnungsDaten.visitCount = rechnungsDaten.visits.length;
  rechnungsDaten.totalAmount = rechnungsDaten.visits.reduce((sum, visit) => sum + (visit.cost || standardPreis), 0);
  rechnungsDaten.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
  
  rechnungsDaten.status = 'offen';
  
  if (new Date() > new Date(rechnungsDaten.dueDate)) {
    rechnungsDaten.status = 'überfällig';
  }
  
  await invoiceRef.set(rechnungsDaten, { merge: true });
}

// Manuelle Aktualisierung - kann im Browser aufgerufen werden
window.updateDueDates = async function() {
  if (auth.currentUser) {
    await aktualisiereAlleFaelligkeitsdaten(auth.currentUser.uid);
  }
};

async function aktualisiereAlleFaelligkeitsdaten(userId) {
  try {
    const invoicesSnapshot = await db.collection("Invoices")
      .where("einrichtungsId", "==", userId)
      .get();
    
    if (invoicesSnapshot.empty) return;
    
    let aktualisiert = 0;
    
    for (const invoiceDoc of invoicesSnapshot.docs) {
      const invoiceData = invoiceDoc.data();
      const year = invoiceData.year;
      const month = invoiceData.monthNumber - 1;
      const neuesFaelligkeitsdatum = new Date(year, month + 1, 6).toISOString().split('T')[0];
      
      if (invoiceData.dueDate !== neuesFaelligkeitsdatum) {
        await invoiceDoc.ref.update({
          dueDate: neuesFaelligkeitsdatum,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        aktualisiert++;
      }
    }
    
    if (aktualisiert > 0) {
      await displayInvoices();
    }
  } catch (error) {
    // Fehler ignorieren
  }
}

// Hilfsfunktion: Verarbeite gefundene Activities
async function verarbeiteGefundeneActivities(activitiesSnapshot, userId) {
  const existingActivityIds = new Set();
  let bearbeitet = 0;
  
  let invoicesSnapshot;
  try {
    invoicesSnapshot = await db.collection("Invoices")
      .where("einrichtungsId", "==", userId)
      .get();
  } catch (invoiceError) {
    invoicesSnapshot = { docs: [] };
  }
  
  const alreadyProcessedActivities = new Set();
  invoicesSnapshot.docs.forEach(invoiceDoc => {
    const invoiceData = invoiceDoc.data();
    if (invoiceData.visits) {
      invoiceData.visits.forEach(visit => {
        alreadyProcessedActivities.add(visit.activityId);
      });
    }
  });
  
  for (const doc of activitiesSnapshot.docs) {
    const data = doc.data();
    
    existingActivityIds.add(doc.id);
    const name = data.nameDerAktivität || data.name || '';
    
    if (name.trim() && !alreadyProcessedActivities.has(doc.id)) {
      await verarbeiteActivity(doc.id, data, userId);
      bearbeitet++;
    }
    
    processedActivities.add(doc.id);
  }
  
  console.log(`✅ ${bearbeitet} Activities verarbeitet`);
  
  await bereinigeVerwaiseRechnungen(userId, existingActivityIds);
  
  if (bearbeitet > 0) {
    await displayInvoices();
  }
}

// Rechnungsanzeige
async function displayInvoices() {
  if (!invoicesList) return;
  
  invoicesList.innerHTML = '<p>Lade Rechnungen...</p>';
  
  try {
    const einrichtungsId = auth.currentUser?.uid;
    if (!einrichtungsId) throw new Error("Nicht angemeldet");
    
    const snapshot = await db.collection("Invoices")
      .where("einrichtungsId", "==", einrichtungsId)
      .get();
    
    invoiceData = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      invoiceData.push({
        id: data.invoiceId,
        month: data.month,
        visitCount: data.visitCount || 0,
        pricePerVisit: data.pricePerVisit || standardPreis,
        totalAmount: data.totalAmount || 0,
        status: data.status || 'offen',
        paymentDate: data.paymentDate,
        dueDate: data.dueDate,
        visits: data.visits || [],
        year: data.year || new Date().getFullYear(),
        monthNumber: data.monthNumber || 1
      });
    });
    
    invoiceData.sort((a, b) => b.year - a.year || b.monthNumber - a.monthNumber);
    
    const existingSummary = document.querySelector('.invoice-summary');
    if (existingSummary) existingSummary.remove();
    
    invoicesList.innerHTML = '';
    
    if (invoiceData.length === 0) {
      invoicesList.innerHTML = '<p>📄 Noch keine Rechnungen vorhanden. Rechnungen werden automatisch erstellt.</p>';
      return;
    }
    
    const table = document.createElement('table');
    table.className = 'invoices-table';
    table.innerHTML = `
      <thead>
        <tr>
          <th>Monat</th>
          <th>Aktivitäten</th>
          <th>Betrag</th>
          <th>Status</th>
          <th>Fällig am</th>
          <th>Aktionen</th>
        </tr>
      </thead>
      <tbody>
        ${invoiceData.map(invoice => createInvoiceRow(invoice)).join('')}
      </tbody>
    `;
    
    invoicesList.appendChild(table);
    addSummary();
    
  } catch (error) {
    if (error.message.includes('index')) {
      const indexLink = error.message.match(/https:\/\/[^\s]+/)?.[0];
      invoicesList.innerHTML = `
        <div style="background: #d1ecf1; padding: 20px; border-radius: 8px; text-align: center;">
          <h3>🔧 Firebase Index erforderlich</h3>
          <p>Klicken Sie den Link zum Erstellen:</p>
          ${indexLink ? `<a href="${indexLink}" target="_blank" style="background: #007bff; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none;">Index erstellen</a>` : ''}
          <p style="margin-top: 15px; font-size: 0.9em;">Nach dem Erstellen Seite neu laden.</p>
        </div>
      `;
    } else {
      invoicesList.innerHTML = '<p>Fehler beim Laden. Bitte neu laden oder anmelden.</p>';
    }
  }
}

function createInvoiceRow(invoice) {
  const statusInfo = statusConfig[invoice.status];
  
  return `
    <tr>
      <td><strong>${invoice.month}</strong><br><small>${invoice.id}</small></td>
      <td>${invoice.visitCount}</td>
      <td><strong>${formatCurrency(invoice.totalAmount)}</strong><br><small>${formatCurrency(invoice.pricePerVisit)} pro Aktivität</small></td>
      <td><span class="status-badge ${statusInfo.class}" style="color: ${statusInfo.color}; padding: 4px 8px; border-radius: 4px; font-size: 0.9em;">${statusInfo.icon} ${statusInfo.text}</span></td>
      <td>${formatDate(invoice.dueDate)}${invoice.paymentDate ? `<br><small>Bezahlt: ${formatDate(invoice.paymentDate)}</small>` : ''}</td>
      <td>
        <button class="btn-secondary" onclick="showInvoiceDetails('${invoice.id}')" style="margin-right: 5px; padding: 5px 10px; font-size: 0.9em;">Details</button>
        ${invoice.status !== 'bezahlt' ? `<button class="btn-primary" onclick="processPayment('${invoice.id}')" style="padding: 5px 10px; font-size: 0.9em;">Bezahlen</button>` : ''}
      </td>
    </tr>
  `;
}

function createInvoiceCard(invoice) {
  const statusInfo = statusConfig[invoice.status];
  
  return `
    <div class="invoice-card">
      <div class="invoice-card-header">
        <div>
          <div class="invoice-card-title">${invoice.month}</div>
          <div class="invoice-card-id">${invoice.id}</div>
        </div>
        <span class="status-badge ${statusInfo.class}" style="color: ${statusInfo.color};">
          ${statusInfo.icon} ${statusInfo.text}
        </span>
      </div>
      
      <div class="invoice-card-details">
        <div class="invoice-card-row">
          <span class="invoice-card-label">Aktivitäten:</span>
          <span class="invoice-card-value">${invoice.visitCount}</span>
        </div>
        <div class="invoice-card-row">
          <span class="invoice-card-label">Gesamtbetrag:</span>
          <span class="invoice-card-value"><strong>${formatCurrency(invoice.totalAmount)}</strong></span>
        </div>
        <div class="invoice-card-row">
          <span class="invoice-card-label">Pro Aktivität:</span>
          <span class="invoice-card-value">${formatCurrency(invoice.pricePerVisit)}</span>
        </div>
        <div class="invoice-card-row">
          <span class="invoice-card-label">Fällig am:</span>
          <span class="invoice-card-value">${formatDate(invoice.dueDate)}</span>
        </div>
        ${invoice.paymentDate ? `
          <div class="invoice-card-row">
            <span class="invoice-card-label">Bezahlt am:</span>
            <span class="invoice-card-value">${formatDate(invoice.paymentDate)}</span>
          </div>
        ` : ''}
      </div>
      
      <div class="invoice-card-actions">
        <button class="btn-secondary" onclick="showInvoiceDetails('${invoice.id}')">Details</button>
        ${invoice.status !== 'bezahlt' ? `<button class="btn-primary" onclick="processPayment('${invoice.id}')">Bezahlen</button>` : ''}
      </div>
    </div>
  `;
}

function addSummary() {
  const totalVisits = invoiceData.reduce((sum, inv) => sum + inv.visitCount, 0);
  const totalAmount = invoiceData.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const openAmount = invoiceData.filter(inv => inv.status !== 'bezahlt').reduce((sum, inv) => sum + inv.totalAmount, 0);
  
  const summaryDiv = document.createElement('div');
  summaryDiv.className = 'invoice-summary';
  summaryDiv.innerHTML = `
    <h2>Zusammenfassung</h2>
    <div class="summary-stats">
      <div class="stat-item"><span>Gesamte Aktivitäten:</span><span>${totalVisits}</span></div>
      <div class="stat-item"><span>Gesamtbetrag:</span><span>${formatCurrency(totalAmount)}</span></div>
      <div class="stat-item"><span>Offener Betrag:</span><span style="${openAmount > 0 ? 'color: red;' : ''}">${formatCurrency(openAmount)}</span></div>
    </div>
  `;
  
  invoicesList.parentNode?.insertBefore(summaryDiv, invoicesList);
}

// Event Handler
function showInvoiceDetails(invoiceId) {
  const invoice = invoiceData.find(inv => inv.id === invoiceId);
  if (!invoice) return safeAlert("Rechnung nicht gefunden.");
  
  const modalHTML = `
    <div id="invoice-modal" class="invoice-modal-overlay">
      <div class="invoice-modal">
        <div class="invoice-modal-header">
          <h2>📄 RECHNUNG ${invoice.month}</h2>
          <button class="invoice-modal-close" onclick="closeInvoiceModal()">&times;</button>
        </div>
        <div class="invoice-modal-content">
          <div class="invoice-summary-section">
            <div class="invoice-info-grid">
              <div class="info-item">
                <strong>Rechnungs-ID:</strong> ${invoice.id}
              </div>
              <div class="info-item">
                <strong>Aktivitäten:</strong> ${invoice.visitCount}
              </div>
              <div class="info-item">
                <strong>Gesamtbetrag:</strong> ${formatCurrency(invoice.totalAmount)}
              </div>
              <div class="info-item">
                <strong>Status:</strong> 
                <span class="status-badge ${statusConfig[invoice.status].class}" style="color: ${statusConfig[invoice.status].color};">
                  ${statusConfig[invoice.status].icon} ${statusConfig[invoice.status].text}
                </span>
              </div>
              <div class="info-item">
                <strong>Fällig am:</strong> ${formatDate(invoice.dueDate)}
              </div>
              ${invoice.paymentDate ? `<div class="info-item"><strong>Bezahlt am:</strong> ${formatDate(invoice.paymentDate)}</div>` : ''}
            </div>
          </div>
          
          <div class="activities-section">
            <h3>🏥 AKTIVITÄTEN</h3>
            <div class="activities-list">
              ${invoice.visits.map((visit, i) => `
                <div class="activity-item">
                  <div class="activity-number">${i + 1}</div>
                  <div class="activity-details">
                    <div class="activity-date">${formatDate(visit.date)}</div>
                    <div class="activity-patient"><strong>Patient:</strong> ${visit.patient}</div>
                    <div class="activity-type"><strong>Typ:</strong> ${visit.type}</div>
                    <div class="activity-doctor"><strong>Notizen:</strong> ${visit.doctor}</div>
                    <div class="activity-cost"><strong>Kosten:</strong> ${formatCurrency(visit.cost)}</div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
        <div class="invoice-modal-footer">
          ${invoice.status !== 'bezahlt' ? 
            `<button class="btn-primary" onclick="processPayment('${invoice.id}'); closeInvoiceModal();">
              💳 Zahlung bestätigen (${formatCurrency(invoice.totalAmount)})
             </button>` : 
            '<div class="paid-indicator">✅ Diese Rechnung ist bereits bezahlt</div>'
          }
          <button class="btn-secondary" onclick="closeInvoiceModal()">Schließen</button>
        </div>
      </div>
    </div>
  `;
  
  const existingModal = document.getElementById('invoice-modal');
  if (existingModal) existingModal.remove();
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  const modal = document.getElementById('invoice-modal');
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeInvoiceModal();
    }
  });
  
  const escapeHandler = (e) => {
    if (e.key === 'Escape') {
      closeInvoiceModal();
      document.removeEventListener('keydown', escapeHandler);
    }
  };
  document.addEventListener('keydown', escapeHandler);
  
  modal._escapeHandler = escapeHandler;
  
  setTimeout(() => {
    modal.focus();
  }, 10);
}

function closeInvoiceModal() {
  const modal = document.getElementById('invoice-modal');
  if (modal) {
    if (modal._escapeHandler) {
      document.removeEventListener('keydown', modal._escapeHandler);
    }
    modal.remove();
  }
}

async function processPayment(invoiceId) {
  const invoice = invoiceData.find(inv => inv.id === invoiceId);
  if (!invoice || invoice.status === 'bezahlt') return;
  
  if (!safeConfirm(`Zahlung bestätigen?\nBetrag: ${formatCurrency(invoice.totalAmount)}`)) return;
  
  try {
    const einrichtungsId = auth.currentUser.uid;
    const docId = `${invoice.id}_${einrichtungsId}`;
    
    await db.collection("Invoices").doc(docId).set({
      status: 'bezahlt',
      paymentDate: new Date().toISOString().split('T')[0],
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    
    safeAlert("Zahlung erfolgreich!");
    displayInvoices();
  } catch (error) {
    safeAlert('Fehler bei der Zahlung');
  }
}

// Initialisierung
function initApp() {
  // CSS-Datei verlinken (falls noch nicht vorhanden)
  if (!document.getElementById('invoice-responsive-styles')) {
    const link = document.createElement('link');
    link.id = 'invoice-responsive-styles';
    link.rel = 'stylesheet';
    link.href = 'invoice-responsive.css'; // Pfad zur CSS-Datei anpassen
    document.head.appendChild(link);
  }

  auth.onAuthStateChanged(async user => {
    if (user) {
      currentUserId = user.uid;
      console.log(`✅ Benutzer angemeldet: ${currentUserId}`);
      
      await displayInvoices();
      await aktualisiereAlleFaelligkeitsdaten(currentUserId);
      starteActivitiesUeberwachung(currentUserId);
      
      // Suche nach Activities
      setTimeout(async () => {
        try {
          let foundActivities = null;
          
          // Test direkte Collections zuerst (da diese funktionieren)
          const directCollections = [
            { name: "Activities", func: () => db.collection("Activities").get() },
            { name: "activities", func: () => db.collection("activities").get() },
            { name: "aktivitäten", func: () => db.collection("aktivitäten").get() }
          ];
          
          for (const collection of directCollections) {
            try {
              const snapshot = await collection.func();
              if (!snapshot.empty) {
                foundActivities = snapshot;
                console.log(`✅ ${snapshot.docs.length} Activities gefunden in Collection: ${collection.name}`);
                break;
              }
            } catch (error) {
              // Collection nicht verfügbar
            }
          }
          
          // Fallback: users/{userId}/aktivitäten falls direkte Collections leer sind
          if (!foundActivities) {
            console.log(`🔍 Teste UserID: ${currentUserId}`);
            try {
              const snapshot = await db.collection("users").doc(currentUserId).collection("aktivitäten").get();
              if (!snapshot.empty) {
                foundActivities = snapshot;
                console.log(`✅ ${snapshot.docs.length} Activities gefunden unter UserID: ${currentUserId}`);
              }
            } catch (error) {
              // User-spezifische Collection nicht verfügbar
            }
          }
          
          if (foundActivities) {
            console.log(`✅ ${foundActivities.docs.length} Activities gefunden`);
            await verarbeiteGefundeneActivities(foundActivities, currentUserId);
          } else {
            console.log(`❌ Keine Activities gefunden`);
          }
          
        } catch (error) {
          console.log(`❌ Unerwarteter Fehler: ${error.message}`);
        }
      }, 2000);
      
    } else {
      currentUserId = null;
      if (activitiesListener) activitiesListener();
      if (invoicesList) {
        invoicesList.innerHTML = '<p style="text-align: center; padding: 40px;">🔐 Bitte anmelden</p>';
      }
      const summary = document.querySelector('.invoice-summary');
      if (summary) summary.remove();
    }
  });
}

// Cleanup
window.addEventListener('beforeunload', () => {
  if (activitiesListener) activitiesListener();
});

// Start
document.addEventListener('DOMContentLoaded', () => {
  if (typeof firebase === 'undefined') {
    if (invoicesList) invoicesList.innerHTML = '<p>❌ Firebase SDK nicht geladen</p>';
    return;
  }
  initApp();
});

if (document.readyState !== 'loading') initApp();
