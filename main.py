from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

app = FastAPI()

# Spieghiamo a FastAPI che i file dentro "static" sono accessibili
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/") # endpoint
def home():
    # Restituisce direttamente il file HTML
    return FileResponse('static/main.html')

from datetime import datetime

@app.get("/ora")
def dammi_ora():
    # Restituiamo un dizionario (JSON)
    return {"orario": datetime.now().strftime("%H:%M:%S")}
    
# NUOVO: Endpoint con parametro di query
@app.get("/saluta")
def saluta_utente(nome: str):
    return {"messaggio": f"Ciao {nome}, benvenuto nel server di Terza!"}