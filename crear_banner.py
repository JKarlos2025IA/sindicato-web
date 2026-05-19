from PIL import Image, ImageDraw, ImageFont
import math

LOGO_PATH = r"C:\Users\juan.montenegro\Desktop\PAGINA WEB-SINDICATO\sindicato-web\00_public\docs\img\logo_new.png"
OUT = r"C:\Users\juan.montenegro\Desktop\PAGINA WEB-SINDICATO\sindicato-web\00_public\assets\banner_lucha_cas.png"

W, H = 1200, 500
img = Image.new("RGB", (W, H), "#fafafa")
draw = ImageDraw.Draw(img)

# ─── BLOQUE NEGRO IZQUIERDO ───
draw.rectangle([(0, 0), (280, H)], fill="#0a0a0a")

# ─── BLOQUE ROJO DERECHO ───
draw.rectangle([(900, 0), (W, H)], fill="#cc1a1a")

# ─── DIAGONAL (la lucha que rompe) ───
for x in range(900, W):
    y_prop = (x - 900) / (W - 900)
    draw.line([(x, 0), (x, int(H * y_prop))], fill="#fafafa")

# ─── MARCOS DE CONTENCIÓN ───
for y in range(0, 4): draw.line([(280, y), (W, y)], fill="#0a0a0a")  # borde superior
for y in range(H-4, H): draw.line([(0, y), (W, y)], fill="#0a0a0a")  # borde inferior
for y in range(0, H):
    if y % 6 < 2:
        draw.point((278, y), fill="#cc1a1a")  # línea punteada roja entre negro y contenido

# ─── LOGO EN ZONA NEGRA ───
try:
    logo = Image.open(LOGO_PATH).convert("RGBA")
    logo_w = 90
    logo = logo.resize((logo_w, logo_w), Image.LANCZOS)
    img_rgba = img.convert("RGBA")
    img_rgba.paste(logo, (95, 70), logo)
    img = img_rgba.convert("RGB")
    draw = ImageDraw.Draw(img)
except:
    pass

# ─── TIPOGRAFÍA ───
try:
    font_titulo = ImageFont.truetype("arialbd.ttf", 54)
    font_lucha = ImageFont.truetype("arialbd.ttf", 62)
    font_sub = ImageFont.truetype("arial.ttf", 24)
    font_hashtag = ImageFont.truetype("arial.ttf", 18)
    font_mini = ImageFont.truetype("arial.ttf", 14)
except:
    font_titulo = font_lucha = font_sub = font_hashtag = font_mini = ImageFont.load_default()

NEGRO = (10, 10, 10)
BLANCO = (250, 250, 250)
ROJO = (204, 26, 26)
tx = 300  # margen izquierdo después del bloque negro

# ─── TEXTO EN ZONA NEGRA ───
# Número de afiliados
draw.text((95, 185), "69", fill=BLANCO, font=ImageFont.truetype("arialbd.ttf", 28) if "arialbd" not in str(type(font_titulo)) else font_lucha)
draw.text((95, 218), "AFILIADOS", fill=(150, 150, 150), font=font_mini)

# Fecha abajo en zona negra
draw.text((95, 450), "MAYO 2026", fill=(120, 120, 120), font=font_mini)

# ─── TEXTO PRINCIPAL ───
# SIUTCASJNJ
draw.text((tx, 60), "SIUTCASJNJ", fill=NEGRO, font=font_titulo)

# apoya la
draw.text((tx, 130), "apoya la", fill=(100, 100, 100), font=font_sub)

# JORNADA NACIONAL
draw.text((tx, 170), "JORNADA NACIONAL", fill=ROJO, font=font_lucha)

# DE LUCHA
draw.text((tx, 240), "DE LUCHA", fill=NEGRO, font=font_lucha)

# ─── LÍNEA DECORATIVA ───
for x in range(tx, 890):
    draw.line([(x, 320), (x, 322)], fill=NEGRO)

# ─── SUBTEXTO ───
draw.text((tx, 342), "Por la defensa de los derechos laborales de los trabajadores CAS", fill=(60, 60, 60), font=font_sub)

draw.text((tx, 382), "Unidad • Dignidad • Justicia Laboral", fill=(100, 100, 100), font=font_sub)

# ─── PUÑO EN ZONA ROJA ───
# Círculo blanco como fondo del puño
r = 42
cx, cy = 960, 60
draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=BLANCO)
# Mano simple (trapecio + dedos)
draw.rectangle([cx - 14, cy - 5, cx + 14, cy + 18], fill=NEGRO)
draw.rectangle([cx - 18, cy - 18, cx - 9, cy - 5], fill=NEGRO)
draw.rectangle([cx - 6, cy - 22, cx + 2, cy - 5], fill=NEGRO)
draw.rectangle([cx + 6, cy - 22, cx + 14, cy - 5], fill=NEGRO)
draw.rectangle([cx + 15, cy - 16, cx + 22, cy - 5], fill=NEGRO)

# ─── HASHTAGS EN DIAGONAL ROJA ───
draw.text((925, 430), "CASenLucha", fill=BLANCO, font=font_hashtag)
draw.text((925, 455), "UnidadSindical", fill=BLANCO, font=font_hashtag)
draw.text((925, 480), "SIUTCASJNJ", fill=BLANCO, font=font_hashtag)

img.save(OUT, "PNG")
print(f"Banner Rojo Obrero creado: {OUT}")
