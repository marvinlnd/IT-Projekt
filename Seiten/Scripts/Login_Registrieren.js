
 const firebaseConfig = {
    apiKey: "AIzaSyAakpWbT87pJ4Bv1Xr0Mk2lCNhNols7KR4",
    authDomain: "it-projekt-ffc4d.firebaseapp.com",
    projectId: "it-projekt-ffc4d",
    storageBucket: "it-projekt-ffc4d.appspot.com",
    messagingSenderId: "534546734981",
    appId: "1:534546734981:web:13bffd7c78893bd0e3aeec"
  };

  firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  const db = firebase.firestore();

  function togglePasswordVisibility(id, iconElement) {
    const input = document.getElementById(id);
    const icon = iconElement.querySelector("i");
    if (input.type === "password") {
      input.type = "text";
      icon.classList.replace("fa-eye-slash", "fa-eye");
    } else {
      input.type = "password";
      icon.classList.replace("fa-eye", "fa-eye-slash");
    }
  }

  function toggleForms() {
    document.getElementById("login-form").classList.toggle("hidden");
    document.getElementById("register-form").classList.toggle("hidden");
    document.getElementById("reset-form").classList.add("hidden");
  }

  function showPasswordReset() {
    document.getElementById("login-form").classList.add("hidden");
    document.getElementById("register-form").classList.add("hidden");
    document.getElementById("reset-form").classList.remove("hidden");
  }

  function backToLogin() {
    document.getElementById("reset-form").classList.add("hidden");
    document.getElementById("login-form").classList.remove("hidden");
    document.getElementById("reset-email").value = "";
    document.getElementById("reset-error").style.display = "none";
  }

  function handleLogin() {
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value.trim();

    auth.signInWithEmailAndPassword(email, password)
      .then(userCredential => {
    const toast = document.getElementById("login-success-toast");
    toast.style.display = "block";
    setTimeout(() => {
    toast.style.display = "none";
    const user = userCredential.user;
    localStorage.setItem("user-id", JSON.stringify(user.uid));
	window.location.href = 'html/index.html';
    }, 500); // verschwindet nach 1/2 Sekunden

      })
      .catch(error => {
        alert(error.message);
      });
  }

  function handleRegister() {
    const lastname = document.getElementById("register-lastname").value.trim();
    const firstname = document.getElementById("register-firstname").value.trim();
    const email = document.getElementById("register-email").value.trim();
    const password = document.getElementById("register-password").value.trim();
    const checkbox = document.getElementById("privacy-register");
    const errorText = document.getElementById("register-error");
    const checkboxContainer = document.getElementById("register-checkbox-container");

    if (!checkbox.checked) {
      errorText.style.display = "block";
      checkboxContainer.classList.add("error-border");
      return;
    }

    errorText.style.display = "none";
    checkboxContainer.classList.remove("error-border");

    auth.createUserWithEmailAndPassword(email, password)
      .then(userCredential => {
        const user = userCredential.user;
        return db.collection("users").doc(user.uid).set({
          vorname: firstname,
          nachname: lastname,
          email: email,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      })
      .then(() => {
        alert("Registrierung erfolgreich! Bitte logge dich jetzt ein.");
        toggleForms();
      })
      .catch(error => {
        alert(error.message);
      });
  }

  function handleReset() {
    const email = document.getElementById("reset-email").value.trim();
    const errorText = document.getElementById("reset-error");

    if (email === "") {
      errorText.style.display = "block";
      return;
    }

    auth.sendPasswordResetEmail(email)
      .then(() => {
        alert("E-Mail zum Zurücksetzen wurde gesendet!");
        backToLogin();
      })
      .catch(error => {
        alert(error.message);
      });
  }
