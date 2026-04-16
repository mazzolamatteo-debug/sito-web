// MAPPA
var map = L.map('map').setView([45.4642, 9.1900], 12);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'OpenStreetMap'
}).addTo(map);

var markersGroup = L.layerGroup().addTo(map);

// ORA
async function chiediOra() {
    const res = await fetch('/ora');
    const dati = await res.json();
    document.getElementById('orario').innerText = dati.orario;
}

// SALUTO
async function chiediSaluto() {
    const nome = document.getElementById('input-nome').value;
    const res = await fetch(`/saluta?nome=${nome}`);
    const dati = await res.json();
    document.getElementById('risposta-saluto').innerText = dati.messaggio;
}

// CERCA
async function cercaFontanelle() {
    const quartiere = document.getElementById('input-nil').value.toUpperCase();
    const res = await fetch(`/cerca_fontanelle?quartiere=${quartiere}`);
    const dati = await res.json();

    document.getElementById('info-risultati').innerText = dati.messaggio;

    const corpo = document.getElementById('corpo-tabella');
    corpo.innerHTML = "";
    markersGroup.clearLayers();

    if (dati.fontanelle.length > 0) {
        document.getElementById('tabella-fontanelle').style.display = "table";

        dati.fontanelle.forEach(f => {
            corpo.innerHTML += `
                <tr>
                    <td>${f.objectID}</td>
                    <td>${f.NIL}</td>
                    <td>${f.MUNICIPIO}</td>
                </tr>
            `;

            if (f.LAT_Y_4326 && f.LONG_X_4326) {
                L.marker([f.LAT_Y_4326, f.LONG_X_4326])
                    .addTo(markersGroup);
            }
        });

        const prima = dati.fontanelle[0];
        map.setView([prima.LAT_Y_4326, prima.LONG_X_4326], 14);
    }
}

// 🔢 CONTA FONTANELLE
async function contaFontanelle() {
    const res = await fetch('/conta_fontanelle');
    const dati = await res.json();

    document.getElementById('info-conteggi').innerText = dati.messaggio;

    const corpo = document.getElementById('corpo-conteggi');
    corpo.innerHTML = "";

    if (dati.conteggi.length > 0) {
        document.getElementById('tabella-conteggi').style.display = "table";

        dati.conteggi.forEach(c => {
            corpo.innerHTML += `
                <tr>
                    <td>${c.NIL}</td>
                    <td>${c.totale}</td>
                </tr>
            `;
        });
    }
}

// EVENTI
document.getElementById('btn-ora').addEventListener('click', chiediOra);
document.getElementById('btn-saluto').addEventListener('click', chiediSaluto);
document.getElementById('btn-cerca').addEventListener('click', cercaFontanelle);
document.getElementById('btn-conta').addEventListener('click', contaFontanelle);