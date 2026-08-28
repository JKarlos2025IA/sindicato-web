"""
Red de seguridad del Cumpleaños Diario SIUTCASJNJ (PC de Juan)
===============================================================
Corre a las 06:35 AM (hora Lima) desde el Programador de Tareas de Windows.

Mision: garantizar que el saludo de cumpleaños llegue al grupo ANTES de las
07:00 AM, aunque GitHub Actions falle o se retrase.

Estrategia (3 capas):
  Capa 1: GitHub Actions cron 11:00 UTC (06:00 Lima) + respaldo 11:25 UTC
  Capa 2: Este script (06:35 Lima): dispara el workflow por API (repo_dispatch)
          y espera a que termine. Si el saludo ya fue enviado (marcado en
          Firestore), el workflow mismo sale limpio sin duplicar.
  Capa 3: Si el disparo API falla, envía alerta al chat de Juan via el bot
          del proyecto 2300 (Abc_Teacher) para que se sepa de inmediato.

Sin credenciales en el codigo: la clave de Firestore esta en
02_utilidades/firebase-key.json (gitignored) y el token del bot 2300 en
G:/Mi unidad/03_PROJECTS/2300_BOT TELEGRAM/00_SCRIPTS/config.json.
"""
import os, sys, json, time, subprocess
from datetime import datetime, timezone
from urllib.request import urlopen, Request

BASE = os.path.dirname(os.path.abspath(__file__))
REPO = "JKarlos2025IA/sindicato-web"
WORKFLOW = "cumpleanios.yml"
ALERT_BOT_CONFIG = r"G:\Mi unidad\03_PROJECTS\2300_BOT TELEGRAM\00_SCRIPTS\config.json"
JUAN_CHAT_ID = 7189691928

def log(msg):
    print(f"[{datetime.now().strftime('%H:%M:%S')}] {msg}", flush=True)

def gh_token():
    """Recupera el token de GitHub del Git Credential Manager de Windows."""
    r = subprocess.run(
        ["git", "credential", "fill"],
        input="protocol=https\nhost=github.com\n",
        capture_output=True, text=True, timeout=20,
        cwd=BASE
    )
    for line in r.stdout.splitlines():
        if line.startswith("password="):
            return line.split("=", 1)[1]
    return None

def api(method, path, token, body=None):
    url = f"https://api.github.com{path}"
    data = json.dumps(body).encode() if body is not None else None
    req = Request(url, data=data, method=method, headers={
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github+json",
        "Content-Type": "application/json",
    })
    try:
        with urlopen(req, timeout=30) as resp:
            txt = resp.read()
            return resp.status, json.loads(txt) if txt else {}
    except Exception as e:
        body_str = ""
        try:
            body_str = e.read().decode()[:200]
        except Exception:
            pass
        return getattr(e, "code", 0), {"error": str(e), "body": body_str}

def dispatch_workflow(token):
    """Dispara el workflow manualmente. Devuelve (ok, detalle)."""
    code, resp = api("POST", f"/repos/{REPO}/actions/workflows/{WORKFLOW}/dispatches",
                     token, {"ref": "main"})
    return code == 204, f"HTTP {code} {resp.get('error','') or resp.get('message','')}"

def esperar_run(token, timeout_min=6):
    """Espera a que el run disparado termine. Devuelve (conclusion, run_number)."""
    deadline = time.time() + timeout_min * 60
    started = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M")
    time.sleep(15)  # darle tiempo a que el run aparezca
    while time.time() < deadline:
        code, resp = api("GET", f"/repos/{REPO}/actions/runs?per_page=3", token)
        for r in resp.get("workflow_runs", []):
            if (r.get("event") == "workflow_dispatch"
                    and r.get("created_at", "") >= started):
                if r["status"] != "completed":
                    break  # sigue en progreso: volver a sondear
                return r.get("conclusion"), r.get("run_number")
        time.sleep(20)
    return "timeout", None

def alerta_telegram(mensaje):
    """Alerta a Juan por el bot 2300 (Abc_Teacher) si todo lo demas falla."""
    try:
        with open(ALERT_BOT_CONFIG, "r", encoding="utf-8") as f:
            cfg = json.load(f)
        token = cfg.get("bot_token")
        url = f"https://api.telegram.org/bot{token}/sendMessage"
        data = json.dumps({"chat_id": JUAN_CHAT_ID, "text": mensaje}).encode()
        req = Request(url, data=data, headers={"Content-Type": "application/json"})
        with urlopen(req, timeout=30) as resp:
            return json.loads(resp.read()).get("ok", False)
    except Exception as e:
        log(f"  (alerta no enviada: {e})")
        return False

def ya_se_envio_hoy_firestore():
    """Chequea Firestore directamente: el dedupe de hoy existe?"""
    try:
        import firebase_admin
        from firebase_admin import credentials, firestore
        key_path = os.path.join(BASE, "..", "02_utilidades", "firebase-key.json")
        if not os.path.exists(key_path):
            return None
        if not firebase_admin._apps:
            with open(key_path, "r", encoding="utf-8") as f:
                cred = credentials.Certificate(json.load(f))
            firebase_admin.initialize_app(cred)
        db = firestore.client()
        doc_id = datetime.now().strftime("%Y-%m-%d")
        snap = db.collection("cumpleanios_enviados").document(doc_id).get()
        return snap.exists
    except Exception as e:
        log(f"  (check Firestore falló: {e})")
        return None

def main():
    log("=== RESPALDO LOCAL CUMPLEAÑOS (garante 07:00) ===")
    hoy = datetime.now().strftime("%Y-%m-%d")

    # 0) Si ya se envió hoy, nada que hacer
    ya = ya_se_envio_hoy_firestore()
    if ya is True:
        log("Ya enviado hoy (Firestore) — nada que hacer.")
        return
    if ya is None:
        log("Firestore no accesible localmente — se procede con el disparo.")

    # 1) Disparar workflow
    token = gh_token()
    if not token:
        log("ERROR: no pude obtener token de GitHub (credential manager).")
        alerta_telegram("⚠️ SINDICATO: el respaldo local de cumpleaños no pudo "
                        "obtener token de GitHub. Revisar a mano HOY.")
        sys.exit(1)

    ok, det = dispatch_workflow(token)
    log(f"Dispatch: {'OK' if ok else 'FALLÓ'} ({det})")
    if not ok:
        log("Se intenta alerta...")
        alerta_telegram("⚠️ SINDICATO: GitHub no aceptó el disparo del workflow "
                        "de cumpleaños. Revisar a mano HOY.")
        sys.exit(1)

    # 2) Esperar resultado del run
    conclusion, run_num = esperar_run(token)
    log(f"Run #{run_num}: {conclusion}")
    if conclusion != "success":
        alerta_telegram(f"⚠️ SINDICATO: el workflow de cumpleaños terminó "
                        f"'{conclusion}' (run #{run_num}). Revisar a mano HOY.")
        sys.exit(1)

    log("=== FIN OK ===")

if __name__ == "__main__":
    main()
