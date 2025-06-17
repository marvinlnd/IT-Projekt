import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import {
  initializeFirestore,
  enableIndexedDbPersistence
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAakpWbT87pJ4Bv1Xr0Mk2lCNhNols7KR4",
  authDomain: "it-projekt-ffc4d.firebaseapp.com",
  projectId: "it-projekt-ffc4d",
  storageBucket: "it-projekt-ffc4d.firebasestorage.app",
  messagingSenderId: "534546734981",
  appId: "1:534546734981:web:13bffd7c78893bd0e3aeec"
};

const app = initializeApp(firebaseConfig);

const db = initializeFirestore(app, {
  // optional: { experimentalForceLongPolling: true }
});

enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.error("Mehrere Tabs offen – IndexedDB-Persistenz nicht möglich");
  } else if (err.code === 'unimplemented') {
    console.error("Browser unterstützt kein persistentes Offline-Caching");
  }
});
