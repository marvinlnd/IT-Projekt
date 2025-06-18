  
// Automatische Rechnungserstellung für alle Activities
 

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
const parseFirestoreDate = date => {
  if (!date) return new Date();
  if (typeof date.toDate === 'function') return date.toDate();
  return new Date(date);
};

// Automatische Rechnungserstellung
function starteActivitiesUeberwachung(userId) {
  if (activitiesListener) activitiesListener();
  
  activitiesListener = db.collection("Activities").onSnapshot(async snapshot => {
    const changes = snapshot.docChanges();
    
    // Neue Activities
    const newActivities = changes.filter(change => {
      const isAdded = change.type === "added";
      const data = change.doc.data();
      const activityUserId = data.userId;
      const isCorrectUser = activityUserId === userId || !activityUserId;
      return isAdded && isCorrectUser;
    });
    
    // Gelöschte Activities  
    const deletedActivities = changes.filter(change => {
      const isRemoved = change.type === "removed";
      const data = change.doc.data();
      const activityUserId = data.userId;
      const isCorrectUser = activityUserId === userId || !activityUserId;
      return isRemoved && isCorrectUser;
    });
    
    // Neue Activities verarbeiten
    for (const change of newActivities) {
      await verarbeiteActivity(change.doc.id, change.doc.data(), userId);
    }
    
    // Gelöschte Activities aus Rechnungen entfernen
    for (const change of deletedActivities) {
      await entferneActivityAusRechnungen(change.doc.id, userId);
    }
    
    if (newActivities.length > 0 || deletedActivities.length > 0) {
      await displayInvoices();
    }
  }, (error) => {
    console.error("❌ Fehler bei Activities-Überwachung:", error);
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
    console.error('❌ Fehler beim Entfernen der Activity aus Rechnungen:', error);
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
    console.error('❌ Fehler beim Bereinigen verwaister Rechnungen:', error);
  }
}

async function verarbeiteActivity(activityId, data, userId) {
  if (processedActivities.has(activityId)) return;
  
  const name = data.nameDerAktivität || data.name || '';
  if (!name.trim()) return;
  
  processedActivities.add(activityId);
  
  const datum = parseFirestoreDate(data.begin || data.startDate);
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
      
      // Prüfen ob Activity bereits in dieser Rechnung vorhanden ist
      const existingVisit = rechnungsDaten.visits?.find(v => v.activityId === activityId);
      if (existingVisit) {
        return; // Activity bereits vorhanden, nichts zu tun
      }
      
      // Wenn Rechnung bezahlt ist, neue offene Rechnung für den gleichen Monat erstellen
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
          dueDate: new Date(year, month + 1, 10).toISOString().split('T')[0],
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          visits: []
        };
        
        // Neue Rechnung verwenden
        await verarbeiteActivityInRechnung(newInvoiceRef, rechnungsDaten, activityId, data);
        return;
      }
    } else {
      // Neue Rechnung erstellen
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
        dueDate: new Date(year, month + 1, 10).toISOString().split('T')[0],
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        visits: []
      };
    }
    
    await verarbeiteActivityInRechnung(invoiceRef, rechnungsDaten, activityId, data);
    
  } catch (error) {
    console.error('❌ Fehler beim Erstellen der Rechnung:', error);
  }
}

async function verarbeiteActivityInRechnung(invoiceRef, rechnungsDaten, activityId, data) {
  if (!rechnungsDaten.visits) rechnungsDaten.visits = [];
  
  const datum = parseFirestoreDate(data.begin || data.startDate);
  const now = new Date().toISOString();
  
  const newVisit = {
    activityId,
    date: datum.toISOString().split('T')[0],
    patient: data.patient || "Unbekannt",
    doctor: data.notiz || "Keine Notiz",
    type: data.nameDerAktivität || data.name || '',
    cost: parseFloat(data.kosten || standardPreis),
    addedAt: now
  };
  
  // Activity zur Rechnung hinzufügen
  rechnungsDaten.visits.push(newVisit);
  rechnungsDaten.visitCount = rechnungsDaten.visits.length;
  rechnungsDaten.totalAmount = rechnungsDaten.visits.reduce((sum, visit) => sum + (visit.cost || standardPreis), 0);
  rechnungsDaten.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
  
  // Neue Activities sind immer offen
  rechnungsDaten.status = 'offen';
  
  // Überfälligkeitsprüfung
  if (new Date() > new Date(rechnungsDaten.dueDate)) {
    rechnungsDaten.status = 'überfällig';
  }
  
  await invoiceRef.set(rechnungsDaten, { merge: true });
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
    
    // Summary entfernen
    const existingSummary = document.querySelector('.invoice-summary');
    if (existingSummary) existingSummary.remove();
    
    invoicesList.innerHTML = '';
    
    if (invoiceData.length === 0) {
      invoicesList.innerHTML = '<p>📄 Noch keine Rechnungen vorhanden. Rechnungen werden automatisch erstellt.</p>';
      return;
    }
    
    // Tabelle erstellen
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
    console.error('Fehler beim Laden der Rechnungen:', error);
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
  if (!invoice) return alert("Rechnung nicht gefunden.");
  
  let details = `RECHNUNG ${invoice.month}\n\nAktivitäten: ${invoice.visitCount}\nBetrag: ${formatCurrency(invoice.totalAmount)}\nStatus: ${statusConfig[invoice.status].text}\n\nAKTIVITÄTEN:\n`;
  
  invoice.visits.forEach((visit, i) => {
    details += `${i + 1}. ${formatDate(visit.date)} - ${visit.patient} (${visit.type})\n`;
  });
  
  alert(details);
}

async function processPayment(invoiceId) {
  const invoice = invoiceData.find(inv => inv.id === invoiceId);
  if (!invoice || invoice.status === 'bezahlt') return;
  
  if (!confirm(`Zahlung bestätigen?\nBetrag: ${formatCurrency(invoice.totalAmount)}`)) return;
  
  try {
    const einrichtungsId = auth.currentUser.uid;
    const docId = `${invoice.id}_${einrichtungsId}`;
    
    await db.collection("Invoices").doc(docId).set({
      status: 'bezahlt',
      paymentDate: new Date().toISOString().split('T')[0],
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    
    alert("Zahlung erfolgreich!");
    displayInvoices();
  } catch (error) {
    console.error('Fehler bei Zahlung:', error);
    alert('Fehler bei der Zahlung');
  }
}

// Initialisierung
function initApp() {
  // CSS für Tabelle hinzufügen
  if (!document.getElementById('invoice-table-styles')) {
    const style = document.createElement('style');
    style.id = 'invoice-table-styles';
    style.textContent = `
      .invoices-section {
        margin: 20px 0;
      }
      .invoices-table {
        width: 100%;
        border-collapse: collapse;
        margin: 10px 0 30px 0;
        background: white;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      }
      .invoices-table th {
        background: #f8f9fa;
        padding: 12px;
        text-align: left;
        font-weight: 600;
        border-bottom: 2px solid #dee2e6;
      }
      .invoices-table td {
        padding: 12px;
        border-bottom: 1px solid #dee2e6;
        vertical-align: top;
      }
      .invoices-table tr:hover {
        background: #f8f9fa;
      }
      .status-badge {
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 0.9em;
        font-weight: 500;
		margin-left: -15px;
      }
      .status-paid { background: #d4edda; }
      .status-open { background: #fff3cd; }
      .status-overdue { background: #f8d7da; }
      .amount-due { font-weight: bold; }
    `;
    document.head.appendChild(style);
  }

  auth.onAuthStateChanged(async user => {
    if (user) {
      currentUserId = user.uid;
      console.log(`Benutzer angemeldet: ${currentUserId}`);
      
      // Bestehende Rechnungen laden
      await displayInvoices();
      
      // Überwachung für neue Activities starten
      starteActivitiesUeberwachung(currentUserId);
      
      // Bestehende Activities synchronisieren (einmalig beim Start)
      setTimeout(async () => {
        try {
          const snapshot = await db.collection("Activities").get();
          const existingActivityIds = new Set();
          let bearbeitet = 0;
          
          // Erstmal alle bestehenden Rechnungen laden um zu wissen welche Activities bereits verarbeitet wurden
          const invoicesSnapshot = await db.collection("Invoices")
            .where("einrichtungsId", "==", currentUserId)
            .get();
          
          const alreadyProcessedActivities = new Set();
          invoicesSnapshot.forEach(invoiceDoc => {
            const invoiceData = invoiceDoc.data();
            if (invoiceData.visits) {
              invoiceData.visits.forEach(visit => {
                alreadyProcessedActivities.add(visit.activityId);
              });
            }
          });
          
          // Alle vorhandenen Activities sammeln und nur neue verarbeiten
          for (const doc of snapshot.docs) {
            const data = doc.data();
            const activityUserId = data.userId;
            
            // Activities ohne userId dem aktuellen Benutzer zuordnen
            if (activityUserId === currentUserId || !activityUserId) {
              existingActivityIds.add(doc.id);
              const name = data.nameDerAktivität || data.name || '';
              
              // Nur verarbeiten wenn Activity einen Namen hat UND noch nicht in einer Rechnung ist
              if (name.trim() && !alreadyProcessedActivities.has(doc.id)) {
                await verarbeiteActivity(doc.id, data, currentUserId);
                bearbeitet++;
              }
              
              // Als verarbeitet markieren (auch wenn bereits in Rechnung vorhanden)
              processedActivities.add(doc.id);
            }
          }
          
          console.log(`✅ ${bearbeitet} bestehende Activities synchronisiert`);
          
          // Verwaiste Rechnungseinträge bereinigen
          await bereinigeVerwaiseRechnungen(currentUserId, existingActivityIds);
          
          if (bearbeitet > 0) {
            await displayInvoices();
          }
          
        } catch (error) {
          console.error('❌ Fehler beim Synchronisieren bestehender Activities:', error);
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
