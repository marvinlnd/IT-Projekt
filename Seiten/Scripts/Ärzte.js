// Login-Pop-up Menü: nur die erforderlichen Zeilen

// Elemente selektieren
const loginIcon = document.getElementById('login-icon');
const loginMenu = document.getElementById('login-menu');

// Klick auf das Icon: Menü ein-/ausblenden
loginIcon.addEventListener('click', e => {
  e.stopPropagation();
  const isOpen = loginMenu.classList.toggle('open');
  loginMenu.setAttribute('aria-hidden', !isOpen);
  loginIcon.setAttribute('aria-expanded', isOpen);
});

// Klick außerhalb: Menü schließen
document.addEventListener('click', e => {
  if (!loginIcon.contains(e.target) && !loginMenu.contains(e.target)) {
    loginMenu.classList.remove('open');
    loginMenu.setAttribute('aria-hidden', 'true');
    loginIcon.setAttribute('aria-expanded', 'false');
  }
});

// Menü schließt sich auch, wenn ein Link angeklickt wird
loginMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    loginMenu.classList.remove('open');
    loginMenu.setAttribute('aria-hidden', 'true');
    loginIcon.setAttribute('aria-expanded', 'false');
  });
});

// Firebase-Konfiguration (ersetzen mit deinen Projektdaten!)
const firebaseConfig = {
  apiKey: "AIzaSyAakpWbT87pJ4Bv1Xr0Mk2lCNhNols7KR4",
  authDomain: "it-projekt-ffc4d.firebaseapp.com",
  projectId: "it-projekt-ffc4d",
  storageBucket: "it-projekt-ffc4d.firebasestorage.app",
  messagingSenderId: "534546734981",
  appId: "1:534546734981:web:13bffd7c78893bd0e3aeec"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const arztRef = db.collection("ärzte");
let aktuelleArztId = null;


// DOM-Elemente
const tabelle = document.querySelector("#arztTabelle tbody");
//const indexDropdown = document.getElementById("indexDropdown");
//const indexLoeschenDropdown = document.getElementById("indexLoeschenDropdown");

// Daten abrufen und anzeigen
function ladeDaten() {
  arztRef.get().then(snapshot => {
    const tbody = document.querySelector("#arztTabelle tbody");
    tbody.innerHTML = "";

    snapshot.docs.forEach((doc, index) => {
      const daten = doc.data();

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${index}</td>
        <td>${daten.name}</td>
        <td>${daten.fach}</td>
        <td>${daten.email}</td>
        <td>${daten.telefon}</td>
        <td>${daten.adresse}</td>
      `;

      row.addEventListener("click", (event) => {
      aktuelleArztId = doc.id;
      tbody.querySelectorAll("tr").forEach(r => r.classList.remove("selected"));
      row.classList.add("selected");

      const menu = document.getElementById('context-menu');
      menu.style.display = 'block';
      menu.style.left = `${event.pageX + 5}px`;
      menu.style.top = `${event.pageY + 5}px`;

      // Kontextmenü: Edit-Button
      document.getElementById('edit-button').onclick = () => {
        const modal = document.getElementById('edit-modal-overlay');
        const nameInput    = document.getElementById('modal-arzt-name');
        const fachInput    = document.getElementById('modal-arzt-fach');
        const emailInput   = document.getElementById('modal-arzt-email');
        const telInput     = document.getElementById('modal-arzt-telefon');
        const adresseInput = document.getElementById('modal-arzt-adresse');
        const fertigBtn    = document.getElementById('modal-save');
        const cancelBtn    = document.getElementById('modal-cancel');

        nameInput.value    = daten.name    || "";
        fachInput.value    = daten.fach    || "";
        emailInput.value   = daten.email   || "";
        telInput.value     = daten.telefon || "";
        adresseInput.value = daten.adresse || "";

        modal.style.display = 'flex';
        menu.style.display  = 'none';

        fertigBtn.onclick = async () => {
          const updates = {
            name:    nameInput.value.trim(),
            fach:    fachInput.value.trim(),
            email:   emailInput.value.trim(),
            telefon: telInput.value.trim(),
            adresse: adresseInput.value.trim()
          };

          if (updates.name.length < 2 || updates.fach.length < 2) {
            alert("Bitte mindestens Name und Fach korrekt ausfüllen.");
            return;
          }

          await arztRef.doc(aktuelleArztId).update(updates);
          ladeDaten();
          modal.style.display = 'none';
        };

        cancelBtn.onclick = () => {
          modal.style.display = 'none';
        };
      };

      // Kontextmenü: Delete-Button
      document.getElementById('delete-button').onclick = async () => {
        if (confirm("Willst du diesen Arzt wirklich löschen?")) {
          try {
            await arztRef.doc(aktuelleArztId).delete();
            ladeDaten();
          } catch (err) {
            console.error("Fehler beim Löschen:", err);
            alert("Löschen fehlgeschlagen!");
          }
          menu.style.display = 'none';
        }
      };
    });


      tbody.appendChild(row);

      /* Dropdowns mit IDs aktualisieren
      const option = new Option(`${daten.name} (${index})`, index);
      document.getElementById("indexDropdown").appendChild(option);
      document.getElementById("indexLoeschenDropdown").appendChild(option.cloneNode(true));*/
    });

    console.log(`✅ ${snapshot.size} Ärzte geladen.`);
  }).catch(error => {
    console.error("❌ Fehler beim Laden der Daten:", error);
  });
}



// Arzt hinzufügen
document.getElementById("add-med").addEventListener("click", () => {
  const name = document.getElementById("arztname").value;
  const fach = document.getElementById("fach").value;
  const email = document.getElementById("eMail").value;
  const telefon = document.getElementById("Telefonnummer").value;
  const adresse = document.getElementById("Adresse").value;

  if (name && fach) {
    arztRef.add({ name, fach, email, telefon, adresse }).then(ladeDaten);
  }
});

/* Arzt bearbeiten
document.getElementById("edit-med").addEventListener("click", () => {
  const docId = indexDropdown.value;
  const name = document.getElementById("neuerArztname").value;
  const fach = document.getElementById("neueFach").value;
  const email = document.getElementById("neueEMail").value;
  const telefon = document.getElementById("neueTelefonnummer").value;
  const adresse = document.getElementById("neueAdresse").value;

  if (docId) {
    arztRef.doc(docId).update({
      ...(name && { name }),
      ...(fach && { fach }),
      ...(email && { email }),
      ...(telefon && { telefon }),
      ...(adresse && { adresse })
    }).then(ladeDaten);
  }
});

// Arzt löschen
document.getElementById("delete-arzt").addEventListener("click", () => {
  const docId = indexLoeschenDropdown.value;
  if (docId) {
    arztRef.doc(docId).delete().then(ladeDaten);
  }
});

// Alle löschen
document.getElementById("clear-med").addEventListener("click", () => {
  arztRef.get().then(snapshot => {
    const batch = db.batch();
    snapshot.docs.forEach(doc => batch.delete(doc.ref));
    return batch.commit();
  }).then(ladeDaten);
});*/

document.addEventListener('click', (e) => {
  const menu = document.getElementById('context-menu');
  if (!menu.contains(e.target) && !e.target.closest('tr')) {
    menu.style.display = 'none';
  }
});

// Nach dem Laden Daten holen
document.addEventListener("DOMContentLoaded", ladeDaten);
