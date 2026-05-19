from PIL import Image, ImageDraw, ImageFont, ImageFilter

LOGO_PATH = r"C:\Users\juan.montenegro\Desktop\PAGINA WEB-SINDICATO\sindicato-web\00_public\docs\img\logo_new.png"
OUT = r"C:\Users\juan.montenegro\Desktop\PAGINA WEB-SINDICATO\sindicato-web\00_public\assets\banner_lucha_cas.png"

W, H = 1200, 500
img = Image.new("RGB", (W, H), "#ffffff")
draw = ImageDraw.Draw(img)

# Barra superior azul institucional
draw.rectangle([(0, 0), (W, 6)], fill="#0f2a5a")

# Barra inferior roja
draw.rectangle([(0, H-6), (W, H)], fill="#cc1a1a")

# Fondo sutil (muy tenue, casi blanco)
for y in range(H):
    g = 250 - int(5 * y / H)
    draw.line([(0, y), (W, y)], fill=(255, g, g))

# Logo
try:
    logo = Image.open(LOGO_PATH).convert("RGBA")
    logo = logo.resize((100, 100), Image.LANCZOS)
    img_rgba = img.convert("RGBA")
    img_rgba.paste(logo, (60, 55), logo)
    img = img_rgba.convert("RGB")
    draw = ImageDraw.Draw(img)
except:
    pass

# Fuentes
try:
    f_title = ImageFont.truetype("arialbd.ttf", 48)
    f_big = ImageFont.truetype("arialbd.ttf", 56)
    f_sub = ImageFont.truetype("arial.ttf", 26)
    f_small = ImageFont.truetype("arial.ttf", 20)
except:
    f_title = f_big = f_sub = f_small = ImageFont.load_default()

AZUL = (15, 42, 90)
ROJO = (204, 26, 26)
GRIS = (90, 100, 120)
tx = 195

# Línea vertical decorativa
draw.rectangle([(tx - 18, 70), (tx - 14, 380)], fill=ROJO)

# SIUTCASJNJ
draw.text((tx, 70), "SIUTCASJNJ", fill=AZUL, font=f_title)

# apoya la
draw.text((tx, 140), "apoya la", fill=GRIS, font=f_sub)

# JORNADA NACIONAL DE LUCHA
draw.text((tx + 2, 187), "JORNADA NACIONAL DE LUCHA", fill=(0, 0, 0, 30), font=f_big)
draw.text((tx, 185), "JORNADA NACIONAL DE LUCHA", fill=ROJO, font=f_big)

# Línea horizontal
for x in range(tx, 1100):
    draw.line([(x, 260), (x, 262)], fill=ROJO)

# Subtítulo
draw.text((tx, 290), "Por la defensa de los derechos laborales de los trabajadores CAS", fill=GRIS, font=f_sub)

# Hashtags
draw.text((tx, 340), "#UnidadSindical    #CASenLucha    #SIUTCASJNJ", fill=(140, 145, 155), font=f_small)

# Pie
draw.text((tx, 385), "Junta Nacional de Justicia  •  Gestión 2026-2028  •  69 afiliados", fill=(160, 165, 175), font=f_small)

# Franja informativa abajo
draw.rectangle([(0, 430), (W, H-6)], fill="#f5f5f5")
draw.text((60, 445), "LIMA, PERÚ  |  sindicatocasjnj@gmail.com", fill=(140, 140, 140), font=f_small)

img.save(OUT, "PNG")
print(f"Banner limpio creado: {OUT}")
