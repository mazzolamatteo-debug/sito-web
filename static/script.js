// --- 1. INIZIALIZZAZIONE MAPPA ---
// Centriamo la mappa su Milano (Coordinate 45.4642, 9.1900)
var map = L.map('map').setView([45.4642, 9.1900], 12);

// Carichiamo lo sfondo della mappa da OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Gruppo di marker: ci permette di cancellare i vecchi segnalini a ogni nuova ricerca
var markersGroup = L.layerGroup().addTo(map);

// --- 2. FUNZIONI ORA E SALUTO ---

async function chiediOra() {
    const res = await fetch('/ora');
    const dati = await res.json();
    document.getElementById('orario').innerText = dati.orario;
}

async function chiediSaluto() {
    const nome = document.getElementById('input-nome').value;
    if (!nome) return alert("Scrivi un nome!");
    const res = await fetch(`/saluta?nome=${nome}`);
    const dati = await res.json();
    document.getElementById('risposta-saluto').innerText = dati.messaggio;
}

// --- 3. FUNZIONE RICERCA FONTANELLE (TABELLA + MAPPA) ---

async function cercaFontanelle() {
    const quartiere = document.getElementById('input-nil').value.trim().toUpperCase();
    if (!quartiere) return alert("Inserisci un quartiere!");

    const res = await fetch(`/cerca_fontanelle?quartiere=${quartiere}`);
    const dati = await res.json();

    const info = document.getElementById('info-risultati');
    const corpoTabella = document.getElementById('corpo-tabella');
    const tabella = document.getElementById('tabella-fontanelle');

    // Pulizia precedente
    info.innerText = dati.messaggio;
    corpoTabella.innerHTML = "";
    markersGroup.clearLayers();

    if (dati.fontanelle.length > 0) {
        tabella.style.display = "table";

        dati.fontanelle.forEach(f => {
            // 1. Aggiungi riga alla tabella
            const riga = `<tr>
                <td>${f.objectID}</td>
                <td>${f.NIL}</td>
                <td>${f.MUNICIPIO}</td>
            </tr>`;
            corpoTabella.innerHTML += riga;

            // 2. Aggiungi marker alla mappa
            // Usiamo i nomi delle colonne del CSV: LAT_Y_4326 e LONG_X_4326
            if (f.LAT_Y_4326 && f.LONG_X_4326) {
                L.marker([f.LAT_Y_4326, f.LONG_X_4326])
                 .addTo(markersGroup)
                 .bindPopup(`<b>Fontanella ID: ${f.objectID}</b><br>Quartiere: ${f.NIL}`);
            }
        });

        // Spostiamo la vista della mappa sulla prima fontanella trovata
        const prima = dati.fontanelle[0];
        map.setView([prima.LAT_Y_4326, prima.LONG_X_4326], 14);

    } else {
        tabella.style.display = "none";
    }
}

// --- 4. EVENT LISTENERS ---
document.getElementById('btn-ora').addEventListener('click', chiediOra);
document.getElementById('btn-saluto').addEventListener('click', chiediSaluto);
document.getElementById('btn-cerca').addEventListener('click', cercaFontanelle);