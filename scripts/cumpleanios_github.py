"""
GitHub Actions - Cumpleaños Diario SIUTCASJNJ
=============================================
Ejecutado por GitHub Actions todos los días a las 8:13 AM (hora Perú).

Variables de entorno requeridas:
  FIREBASE_SERVICE_ACCOUNT  - JSON de la clave de servicio (base64 o texto)
  TELEGRAM_BOT_TOKEN        - Token del bot de Telegram
  TELEGRAM_CHAT_ID          - ID del chat/grupo de Telegram
"""
import os, json, sys
from datetime import datetime
from urllib.request import urlopen, Request
from urllib.parse import urlencode

# === CONFIG ===
STORAGE_BASE = "https://storage.googleapis.com/sindicato-jnj.firebasestorage.app/cumpleanios"

def log(msg):
    print(f"[{datetime.now().strftime('%H:%M:%S')}] {msg}")

def get_firestore():
    """Autentica y devuelve cliente Firestore"""
    import firebase_admin
    from firebase_admin import credentials, firestore

    key_json = os.environ.get("FIREBASE_SERVICE_ACCOUNT", "")
    if not key_json:
        log("ERROR: FIREBASE_SERVICE_ACCOUNT no configurado")
        sys.exit(1)

    key_data = json.loads(key_json)
    cred = credentials.Certificate(key_data)
    firebase_admin.initialize_app(cred)
    return firestore.client()

def normalizar(s):
    return s.replace(' ', '_').replace('Ñ','N').replace('Á','A').replace('É','E').replace('Í','I').replace('Ó','O').replace('Ú','U')

def enviar_telegram_video(video_url, caption):
    """Envía video a Telegram usando la API directamente"""
    token = os.environ.get("TELEGRAM_BOT_TOKEN", "")
    chat_id = os.environ.get("TELEGRAM_CHAT_ID", "")

    if not token or not chat_id:
        log(f"ERROR: Telegram no configurado. Token={bool(token)} ChatID={bool(chat_id)}")
        return False

    url = f"https://api.telegram.org/bot{token}/sendVideo"
    data = {
        "chat_id": chat_id,
        "video": video_url,
        "caption": caption,
        "parse_mode": "HTML"
    }
    req = Request(url, data=json.dumps(data).encode(), headers={"Content-Type": "application/json"})
    try:
        with urlopen(req, timeout=30) as resp:
            result = json.loads(resp.read())
            return result.get("ok", False)
    except Exception as e:
        log(f"  ERROR Telegram API: {e}")
        return False

def main():
    log("=== INICIO CUMPLEAÑOS DIARIO ===")

    db = get_firestore()
    hoy = datetime.now()
    fecha_hoy = hoy.strftime("%d/%m")
    log(f"Fecha: {hoy.strftime('%d/%m/%Y')} - Buscando {fecha_hoy}")

    socios = db.collection("socios").stream()
    cumpleañeros = []
    for doc in socios:
        data = doc.to_dict()
        nombre = data.get("nombre", "")
        fecha = data.get("fecha", "")
        activo = data.get("activo", True)

        if not nombre or not fecha:
            continue
        if not activo:
            log(f"  SALTADO (inactivo): {nombre}")
            continue
        if fecha[:5] != fecha_hoy:
            continue

        cumpleañeros.append({"nombre": nombre, "fecha": fecha})

    if not cumpleañeros:
        log("No hay cumpleañeros hoy.")
        log("=== FIN ===")
        return

    log(f"Cumpleañeros: {len(cumpleañeros)}")
    for c in cumpleañeros:
        log(f"  {c['nombre']}")

    enviados = 0
    for c in cumpleañeros:
        nombre = c['nombre']
        safe = normalizar(nombre)
        video_url = f"{STORAGE_BASE}/cumple_{safe}.mp4"
        primer_nombre = nombre.split()[-1]

        caption = (
            f"🎂 ¡Feliz Cumpleaños, {primer_nombre}!\n"
            f"De parte de toda la familia SIUTCASJNJ.\n"
            f"Gestión 2026-2028"
        )

        if enviar_telegram_video(video_url, caption):
            log(f"  ENVIADO: {nombre}")
            enviados += 1
        else:
            log(f"  FALLÓ: {nombre}")

    log(f"=== FIN: {enviados}/{len(cumpleañeros)} enviados ===")

if __name__ == "__main__":
    main()
