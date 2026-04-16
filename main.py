from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from datetime import datetime
import pandas as pd
import os

app = FastAPI()

# Static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Dataset
FILE_CSV = "vedovelle_20260315-233003_final.csv"

if os.path.exists(FILE_CSV):
    df_fontanelle = pd.read_csv(FILE_CSV, sep=';', encoding='utf-8')
    df_fontanelle['NIL'] = df_fontanelle['NIL'].str.strip()
    print(f"Dataset caricato. Righe: {len(df_fontanelle)}")
else:
    print("CSV non trovato!")
    df_fontanelle = pd.DataFrame()

# Home
@app.get("/")
def home():
    return FileResponse('static/main.html')

# Ora
@app.get("/ora")
def dammi_ora():
    return {"orario": datetime.now().strftime("%H:%M:%S")}

# Saluto
@app.get("/saluta")
def saluta_utente(nome: str):
    return {"messaggio": f"Ciao {nome}, benvenuto nella dashboard di Milano!"}

# Cerca fontanelle
@app.get("/cerca_fontanelle")
def cerca_fontanelle(quartiere: str):
    if df_fontanelle.empty:
        return {"messaggio": "Database non caricato", "fontanelle": []}

    quartiere_cercato = quartiere.strip().upper()
    filtro = df_fontanelle[df_fontanelle['NIL'] == quartiere_cercato]

    if filtro.empty:
        return {
            "messaggio": f"Nessuna fontanella trovata per {quartiere_cercato}",
            "fontanelle": []
        }

    return {
        "messaggio": f"Trovate {len(filtro)} fontanelle a {quartiere_cercato}",
        "fontanelle": filtro.to_dict(orient="records")
    }

# 🔢 Conta fontanelle per quartiere
@app.get("/conta_fontanelle")
def conta_fontanelle():
    if df_fontanelle.empty:
        return {"messaggio": "Database non caricato", "conteggi": []}

    conteggio = df_fontanelle.groupby("NIL").size().reset_index(name="totale")
    conteggio = conteggio.sort_values(by="totale", ascending=False)

    return {
        "messaggio": "Conteggio fontanelle per quartiere",
        "conteggi": conteggio.to_dict(orient="records")
    }