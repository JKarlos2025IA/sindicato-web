from PIL import Image, ImageDraw, ImageFont

LOGO_PATH = r"C:\Users\juan.montenegro\Desktop\PAGINA WEB-SINDICATO\sindicato-web\00_public\docs\img\logo_new.png"
OUT = r"C:\Users\juan.montenegro\Desktop\PAGINA WEB-SINDICATO\sindicato-web\00_public\assets\banner_oficial.png"

W, H = 1200, 500
img = Image.new("RGB", (W, H), "#ffffff")
draw = ImageDraw.Draw(img)

# Franja superior azul institucional
for y in range(0, 8):
    draw.line([(0, y), (W, y)], fill=(15, 42, 90))

# Franja inferior naranja
for y in range(480, 500):
    r = 200 + int(34 * (y - 480) / 20)
    g = 70 + int(18 * (y - 480) / 20)
    draw.line([(0, y), (W, y)], fill=(r, g, 12))

# Borde izquierdo sutil
for x in range(0, 4):
    draw.line([(x, 0), (x, H)], fill=(15, 42, 90))

# Cargar logo real
try:
    logo = Image.open(LOGO_PATH).convert("RGBA")
    logo_size = 130
    logo = logo.resize((logo_size, logo_size), Image.LANCZOS)
    img_rgba = img.convert("RGBA")
    img_rgba.paste(logo, (55, (H - logo_size) // 2 - 10), logo)
    img = img_rgba.convert("RGB")
    draw = ImageDraw.Draw(img)
except Exception as e:
    print(f"No se pudo cargar logo: {e}")

# Fuentes
try:
    font_title = ImageFont.truetype("arialbd.ttf", 64)
    font_sub = ImageFont.truetype("arial.ttf", 28)
    font_small = ImageFont.truetype("arial.ttf", 20)
except:
    font_title = ImageFont.load_default()
    font_sub = font_title
    font_small = font_title

AZUL = (15, 42, 90)
GRIS = (80, 90, 110)
NARANJA = (234, 88, 12)
tx = 220

# Línea vertical decorativa
for y in range(130, 370):
    draw.line([(tx - 15, y), (tx - 13, y)], fill=NARANJA)

# Título
draw.text((tx, 120), "SIUTCASJNJ", fill=AZUL, font=font_title)

# Subtítulo
draw.text((tx, 210), "Sindicato Único de Trabajadores CAS", fill=GRIS, font=font_sub)

# Gestión
draw.text((tx, 255), "Junta Nacional de Justicia  •  Gestión 2026-2028", fill=(120, 130, 150), font=font_small)

# Línea decorativa horizontal
for x in range(tx, 900):
    y_line = 295
    color = (234, 88 + int(50 * (x - tx) / (900 - tx)), 12)
    draw.line([(x, y_line), (x, y_line + 3)], fill=color)

# Texto slogan
draw.text((tx, 330), "Unidad y compromiso por nuestros derechos.", fill=(60, 70, 90), font=font_small)

img.save(OUT, "PNG")
print(f"Banner blanco institucional creado: {OUT}")
