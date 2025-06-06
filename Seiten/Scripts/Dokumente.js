// Firebase initialisieren
const firebaseConfig = {
  apiKey: "AIzaSyAakpWbT87pJ4Bv1Xr0Mk2lCNhNols7KR4",
  authDomain: "it-projekt-ffc4d.firebaseapp.com",
  projectId: "it-projekt-ffc4d",
  storageBucket: "it-projekt-ffc4d.appspot.com",
  messagingSenderId: "534546734981",
  appId: "1:534546734981:web:13bffd7c78893bd0e3aeec"
};

firebase.initializeApp(firebaseConfig);
const storage = firebase.storage();
const firestore = firebase.firestore();
console.log("✅ Firebase initialisiert!");

const uploadForm = document.getElementById('upload-form');
const fileInput = document.getElementById('file-input');
const documentsTableBody = document.querySelector('#documents-table tbody');

// Lädt alle Dokumente aus Firestore und zeigt sie an
async function loadDocuments() {
  documentsTableBody.innerHTML = '';
  try {
    const snapshot = await firestore.collection('documents').orderBy('uploadedAt', 'desc').get();
    console.log('✅ Dateien aus Firestore geladen.');
    snapshot.forEach(doc => {
      const data = doc.data();
      addDocumentRow(doc.id, data.fileName, data.fileData);
    });
  } catch (error) {
    console.error('Fehler beim Laden der Dokumente:', error);
  }
}

// Fügt eine Tabellenzeile mit Vorschau- und Aktionsbuttons hinzu
function addDocumentRow(id, fileName, fileData) {
  const tr = document.createElement('tr');

  // Dateiname – klickbar zur Vorschau im Modal
  const nameTd = document.createElement('td');
  const previewSpan = document.createElement('span');
  previewSpan.textContent = fileName;
  previewSpan.style.cursor = 'pointer';
  previewSpan.style.color = '#000';
  
  
  previewSpan.addEventListener('mouseenter', () => {
  previewSpan.style.color = 'blue';
  });

  previewSpan.addEventListener('mouseleave', () => {
  previewSpan.style.color = '#000';
  });
  
  
  previewSpan.addEventListener('click', () => {
    const iframe = document.getElementById('preview-frame');
    iframe.src = fileData;
    document.getElementById('preview-modal').style.display = 'flex';
  });
  nameTd.appendChild(previewSpan);

  // Aktionen: Ersetzen & Löschen
  const actionsTd = document.createElement('td');

  // Ersetzen-Button
  const replaceBtn = document.createElement('button');
  replaceBtn.textContent = 'Ersetzen';
  replaceBtn.className = 'btn replace';
  replaceBtn.onclick = () => {
    const replaceInput = document.createElement('input');
    replaceInput.type = 'file';
    replaceInput.accept = '*/*';
    replaceInput.onchange = () => {
      const file = replaceInput.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          await firestore.collection('documents').doc(id).update({
            fileName: file.name,
            fileData: reader.result,
            uploadedAt: firebase.firestore.FieldValue.serverTimestamp()
          });
          console.log('✅ Datei ersetzt.');
          loadDocuments();
        } catch (error) {
          console.error('Fehler beim Ersetzen:', error);
        }
      };
      reader.readAsDataURL(file);
    };
    replaceInput.click();
  };

  // Löschen-Button
  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = 'Löschen';
  deleteBtn.className = 'btn delete';
  deleteBtn.onclick = async () => {
    if (!confirm(`Datei "${fileName}" wirklich löschen?`)) return;
    try {
      await firestore.collection('documents').doc(id).delete();
      console.log('✅ Datei gelöscht.');
      loadDocuments();
    } catch (error) {
      console.error('Fehler beim Löschen:', error);
    }
  };

  actionsTd.appendChild(replaceBtn);
  actionsTd.appendChild(deleteBtn);

  tr.appendChild(nameTd);
  tr.appendChild(actionsTd);
  documentsTableBody.appendChild(tr);
}

// Datei-Upload Formular
uploadForm.addEventListener('submit', e => {
  e.preventDefault();
  const file = fileInput.files[0];
  if (!file) {
    alert('Bitte eine Datei auswählen.');
    return;
  }
  const reader = new FileReader();
  reader.onload = async () => {
    try {
      await firestore.collection('documents').add({
        fileName: file.name,
        fileData: reader.result,
        uploadedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      console.log('✅ Datei in Firestore gespeichert.');
      uploadForm.reset();
      loadDocuments();
    } catch (error) {
      console.error('Fehler beim Hochladen:', error);
    }
  };
  reader.readAsDataURL(file);
});

// Dokumente beim Laden der Seite anzeigen
window.addEventListener('load', loadDocuments);

const previewModal = document.getElementById('preview-modal');
const closePreviewBtn = document.getElementById('close-preview-btn');

closePreviewBtn.addEventListener('click', () => {
  previewModal.style.display = 'none';
  // iframe src leeren, damit das Dokument nicht weiter geladen wird
  document.getElementById('preview-frame').src = '';
});

// Modal schließen, wenn man auf den Hintergrund klickt
previewModal.addEventListener('click', (e) => {
  if (e.target === previewModal) {
    previewModal.style.display = 'none';
    document.getElementById('preview-frame').src = '';
  }
});
