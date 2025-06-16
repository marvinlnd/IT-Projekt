const CACHE_NAME = "mediassist-cache-v1";
const URLS_TO_CACHE = [
    "/",
    "../index.html",
    "../html/aktivitäten.html",
    "../html/Ärzte.html",
    "../html/Dokumente.html",
    "../html/Krankenhistoerie.html",
    "../html/Medikationsplan.html",
    "../html/Patienten.html",
    "../html/PersoenlicheDaten.html",
    "../html/rechnung.html",
    "../html/termin.html",
    "../manifest.json",
    "../css/styles.css",
    "../css/Medikationsplan.css",
    "../css/aktivitäten.css",
    "../css/Ärzte.css",
    "../css/Dokumente.css",
    "../css/Krankenhistorie.css",
    "../css/Patienten.css",
    "../css/PersoenlicheDaten.css",
    "../css/rechnung.css",
    "../css/termin.css",

    "/Scripts/Medikationsplan.js",
    "/Scripts/aktivitäten.js",
    "/Scripts/Ärzte.js",
    "/Scripts/Dokumente.js",
    "/Scripts/Fehlererkennung.js",
    "/Scripts/Medikationsplan.js",
    "/Scripts/krankenhistorie.js",
    "/Scripts/Patientendaten.js",
    "/Scripts/PersoenlicheDaten.js",
    "/Scripts/rechnung.js",
    "/Scripts/script.js",
    "/Scripts/termin.js",

    "../Bilder/IT_Projekt/Bild/Logo.png",
    "../Bilder/IT_Projekt/Bild/favicon-192.png",
    "../Bilder/IT_Projekt/Bild/favicon-512.png"
];

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(URLS_TO_CACHE))
    );
});

self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request).then(response => response || fetch(event.request))
    );
});
