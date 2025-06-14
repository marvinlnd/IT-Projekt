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
