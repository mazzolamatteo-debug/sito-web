from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from datetime import datetime
import pandas as pd
import os

app = FastAPI()

# 1. Configurazione Static Files
# Serve per far leggere al browser i file dentro la cartella /static (CSS, JS, immagini)
app.mount("/static", StaticFiles(directory="static"), name="static")

# 2. Caricamento Dataset con Pandas
# Carichiamo il CSV una sola volta all'avvio per rendere le ricerche istantanee
FILE_CSV = "vedovelle_20260315-233003_final.csv"

if os.path.exists(FILE_CSV):
    # Usiamo il separatore ';' come visto nel tuo file
    df_fontanelle = pd.read_csv(FILE_CSV, sep=';', encoding='utf-8')
    # Puliamo la colonna NIL da spazi bianchi prima o dopo il testo
    df_fontanelle['NIL'] = df_fontanelle['NIL'].str.strip()
    print(f"Dataset caricato correttamente. Righe: {len(df_fontanelle)}")
else:
    print(f"ERRORE: Il file {FILE_CSV} non è stato trovato nella cartella del progetto!")
    df_fontanelle = pd.DataFrame()

# --- ENDPOINT API ---

# Rotta per servire la pagina principale
@app.get("/")
def home():
    return FileResponse('static/main.html')

# Endpoint 1: Ora del server
@app.get("/ora")
def dammi_ora():
    return {"orario": datetime.now().strftime("%H:%M:%S")}

# Endpoint 2: Saluto con parametro Query
@app.get("/saluta")
def saluta_utente(nome: str):
    return {"messaggio": f"Ciao {nome}, benvenuto nella dashboard di Milano!"}

# Endpoint 3: Ricerca Fontanelle per NIL (Quartiere)
# Questo endpoint serve sia alla tabella che alla mappa nel frontend
@app.get("/cerca_fontanelle")
def cerca_fontanelle(quartiere: str):
    if df_fontanelle.empty:
        return {"messaggio": "Database non caricato", "fontanelle": []}

    # Convertiamo l'input dell'utente in maiuscolo per confrontarlo col CSV
    quartiere_cercato = quartiere.strip().upper()
    
    # Filtriamo il DataFrame
    filtro = df_fontanelle[df_fontanelle['NIL'] == quartiere_cercato]
    
    if filtro.empty:
        return {
            "messaggio": f"Nessuna fontanella trovata per il quartiere: {quartiere_cercato}",
            "fontanelle": []
        }
    
    # Restituiamo i dati (incluse le colonne LAT_Y_4326 e LONG_X_4326 per la mappa)
    return {
        "messaggio": f"Trovate {len(filtro)} fontanelle a {quartiere_cercato}",
        "fontanelle": filtro.to_dict(orient="records")
    }

# Per avviare: uvicorn main:app --reload