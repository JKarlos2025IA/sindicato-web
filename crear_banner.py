from PIL import Image, ImageDraw, ImageFont
import math

LOGO_PATH = r"C:\Users\juan.montenegro\Desktop\PAGINA WEB-SINDICATO\sindicato-web\00_public\docs\img\logo_new.png"
OUT = r"C:\Users\juan.montenegro\Desktop\PAGINA WEB-SINDICATO\sindicato-web\00_public\assets\banner_oficial.png"

W, H = 1200, 500
img = Image.new("RGB", (W, H), "#0a1628")
draw = ImageDraw.Draw(img)

# Fondo gradiente
for y in range(H):
    r = int(10 + (30 - 10) * y / H)
    g = int(22 + (41 - 22) * y / H)
    b = int(40 + (64 - 40) * y / H)
    draw.line([(0, y), (W, y)], fill=(r, g, b))

# Banda naranja abajo
for y in range(420, 500):
    draw.line([(0, y), (W, y)], fill=(234, 88 + int(50 * (y - 420) / 80), 12))

# Franja naranja superior
for y in range(0, 6):
    draw.line([(0, y), (W, y)], fill=(234, 88, 12))

# Cargar y pegar el logo real
try:
    logo = Image.open(LOGO_PATH).convert("RGBA")
    logo_size = 120
    logo = logo.resize((logo_size, logo_size), Image.LANCZOS)
    img_rgba = img.convert("RGBA")
    img_rgba.paste(logo, (40, (H - logo_size) // 2 - 30), logo)
    img = img_rgba.convert("RGB")
    draw = ImageDraw.Draw(img)
except Exception as e:
    print(f"No se pudo cargar logo: {e}")

# Fuentes
try:
    font_title = ImageFont.truetype("arialbd.ttf", 68)
    font_sub = ImageFont.truetype("arial.ttf", 30)
    font_small = ImageFont.truetype("arial.ttf", 20)
except:
    font_title = ImageFont.load_default()
    font_sub = font_title
    font_small = font_title

# Textos (a la derecha del logo)
tx = 190

# Título
draw.text((tx + 2, 152), "SIUTCASJNJ", fill=(0, 0, 0, 100), font=font_title)
draw.text((tx, 150), "SIUTCASJNJ", fill=(255, 255, 255), font=font_title)

# Subtítulo
draw.text((tx + 2, 252), "Sindicato Único de Trabajadores CAS", fill=(0, 0, 0, 60), font=font_sub)
draw.text((tx, 250), "Sindicato Único de Trabajadores CAS", fill=(210, 220, 240), font=font_sub)

# Gestión
draw.text((tx + 2, 292), "Junta Nacional de Justicia • Gestión 2026-2028", fill=(0, 0, 0, 60), font=font_small)
draw.text((tx, 290), "Junta Nacional de Justicia • Gestión 2026-2028", fill=(160, 170, 190), font=font_small)

# Línea decorativa naranja
for x in range(tx, 900):
    y_line = 330
    color = (234, 88 + int(50 * (x - tx) / (900 - tx)), 12 + int(30 * (x - tx) / (900 - tx)))
    draw.line([(x, y_line), (x, y_line + 3)], fill=color)

# Texto inferior
draw.text((tx + 2, 442), "Unidad y compromiso por nuestros derechos.", fill=(255, 255, 255), font=font_small)

img.save(OUT, "PNG")
print(f"Banner creado con logo real: {OUT}")
