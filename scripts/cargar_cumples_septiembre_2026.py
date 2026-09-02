"""
Carga de cumpleanos de SEPTIEMBRE 2026 en Firestore (socios)
=============================================================
Lista oficial enviada por Juan (02/09/2026) — solo afiliados activos.

- 6 ya existen en Firestore (sin fecha): se ACTUALIZA su fecha.
- 8 son nuevos: se CREAN con datos basicos (uo/cargo/dni/telefono/email
  quedan vacios para completarlos desde el panel admin).

Idempotente: se puede relanzar sin duplicar (busca por nombre normalizado).
Formato de fecha: DD/MM/AAAA (el workflow compara fecha[:5] con DD/MM).

Uso:  python cargar_cumples_septiembre_2026.py
"""
import re, sys, time
sys.stdout.reconfigure(encoding="utf-8")

import firebase_admin
from firebase_admin import credentials, firestore

KEY = r"C:\Users\juan.montenegro\Desktop\PAGINA WEB-SINDICATO\sindicato-web\02_utilidades\firebase-key.json"

# (fecha, nombre) — nombres EXACTOS tal como deben quedar
LISTA = [
    ("05/09/1975", "TABOADA GOMEZ TARCILA ESTHER"),
    ("06/09/1988", "FLORES BELLIDO GRETA MIREYA"),
    ("06/09/1988", "MAYTA CHAMPA ANA AGRIPINA"),
    ("06/09/1983", "MERINO ALEGRIA JANNIE"),
    ("07/09/1990", "MERCADO CERRON JORDAN DONY"),
    ("10/09/1968", "CABRERA VEGA MARIA TERESA"),
    ("13/09/1957", "BOLUARTE ZEGARRA RENE"),
    ("13/09/1995", "LI VALENCIA ALEJANDRO FELIX"),
    ("14/09/1976", "LEVEAU GOICOCHEA XIMENA LAURA TERESA"),
    ("18/09/1991", "ESPINOZA OCHOA DIEGO ALEXANDR"),
    ("19/09/1989", "GARRO VERGARA LUIS DIOFANTO"),
    ("19/09/1966", "MELENDEZ SOTOMAYOR LUIS OSWALDO"),
    ("20/09/1988", "LLAMACURI LERMO MIRIAM RUTH"),
    ("24/09/1978", "MIRANDA JARA DANIEL FAUSTO"),
]

# Genero de los NUEVOS (los 6 existentes conservan el genero ya registrado)
GENERO_NUEVOS = {
    "TABOADA GOMEZ TARCILA ESTHER": "F",
    "MERINO ALEGRIA JANNIE": "F",
    "CABRERA VEGA MARIA TERESA": "F",
    "BOLUARTE ZEGARRA RENE": "M",
    "LI VALENCIA ALEJANDRO FELIX": "M",
    "LEVEAU GOICOCHEA XIMENA LAURA TERESA": "F",
    "MELENDEZ SOTOMAYOR LUIS OSWALDO": "M",
    "MIRANDA JARA DANIEL FAUSTO": "M",
}


def normalizar(s):
    s = s.upper()
    for a, b in (("Á", "A"), ("É", "E"), ("Í", "I"), ("Ó", "O"), ("Ú", "U"), ("Ñ", "N")):
        s = s.replace(a, b)
    return re.sub(r"\s+", " ", s).strip()


def codigo_aleatorio():
    import random, string
    return "".join(random.choices(string.ascii_uppercase + string.digits, k=6))


def main():
    cred = credentials.Certificate(KEY)
    firebase_admin.initialize_app(cred)
    db = firestore.client()

    # Indice por nombre normalizado
    indice = {}
    for d in db.collection("socios").stream():
        x = d.to_dict()
        indice[normalizar(x.get("nombre", ""))] = d.id

    actualizados, creados = [], []
    for fecha, nombre in LISTA:
        n = normalizar(nombre)
        if n in indice:
            doc_id = indice[n]
            db.collection("socios").document(doc_id).update({"fecha": fecha})
            actualizados.append((doc_id, nombre, fecha))
            print(f"UPDATE {doc_id} | {nombre} -> {fecha}")
        else:
            doc = {
                "nombre": nombre,
                "fecha": fecha,
                "activo": True,
                "genero": GENERO_NUEVOS.get(nombre, ""),
                "uo": "", "cargo": "", "dni": "",
                "email": "", "telefono": "",
                "codigo": codigo_aleatorio(),
                "timestamp": int(time.time() * 1000),
            }
            ref = db.collection("socios").add(doc)[1]
            creados.append((ref.id, nombre, fecha))
            print(f"CREATE {ref.id} | {nombre} -> {fecha} (genero {doc['genero']})")

    # Verificacion: releer septiembre completo
    print("\n=== VERIFICACION: socios con cumpleanos en septiembre ===")
    fecha_hoy = time.strftime("%d/%m/%Y")
    total = 0
    for d in db.collection("socios").stream():
        x = d.to_dict()
        f = x.get("fecha", "")
        if len(f) >= 5 and f[3:5] == "09" and x.get("activo", True):
            total += 1
            print(f"  {f} | gen={x.get('genero','?')} | {x.get('nombre','')}")
    print(f"\nTotal septiembre activos: {total} (esperado: {len(LISTA)})")
    print(f"Updates: {len(actualizados)} | Creates: {len(creados)}")


if __name__ == "__main__":
    main()
