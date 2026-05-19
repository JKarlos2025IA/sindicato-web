from PIL import Image, ImageDraw, ImageFont

LOGO_PATH = r"C:\Users\juan.montenegro\Desktop\PAGINA WEB-SINDICATO\sindicato-web\00_public\docs\img\logo_new.png"
OUT = r"C:\Users\juan.montenegro\Desktop\PAGINA WEB-SINDICATO\sindicato-web\00_public\assets\banner_lucha_cas.png"

W, H = 1200, 500
img = Image.new("RGB", (W, H), "#1a0a0a")
draw = ImageDraw.Draw(img)

# Fondo dramático
for y in range(H):
    r = int(26 + 40 * y / H)
    g = int(10 - 5 * y / H)
    b = int(10 - 5 * y / H)
    draw.line([(0, y), (W, y)], fill=(r, max(g, 0), max(b, 0)))

# Banda roja superior
for y in range(0, 8):
    draw.line([(0, y), (W, y)], fill=(200, 20, 20))

# Banda roja inferior
for y in range(470, 500):
    draw.line([(0, y), (W, y)], fill=(180, 15, 15))

# Logo
try:
    logo = Image.open(LOGO_PATH).convert("RGBA")
    logo = logo.resize((100, 100), Image.LANCZOS)
    img_rgba = img.convert("RGBA")
    img_rgba.paste(logo, (50, 30), logo)
    img = img_rgba.convert("RGB")
    draw = ImageDraw.Draw(img)
except:
    pass

# Fuentes
try:
    font_big = ImageFont.truetype("arialbd.ttf", 52)
    font_med = ImageFont.truetype("arialbd.ttf", 34)
    font_sm = ImageFont.truetype("arial.ttf", 22)
except:
    font_big = font_med = font_sm = ImageFont.load_default()

ROJO = (220, 30, 30)
BLANCO = (255, 255, 255)
GRIS = (200, 180, 180)

tx = 180

# Línea roja lateral
for x in range(tx - 20, tx - 16):
    for y in range(80, 400):
        draw.point((x, y), fill=ROJO)

# Título principal
draw.text((tx + 2, 82), "SIUTCASJNJ", fill=(0, 0, 0), font=font_big)
draw.text((tx, 80), "SIUTCASJNJ", fill=BLANCO, font=font_big)

# Subtítulo 1
draw.text((tx + 2, 152), "apoya la", fill=(0, 0, 0), font=font_med)
draw.text((tx, 150), "apoya la", fill=GRIS, font=font_med)

# JORNADA NACIONAL
draw.text((tx + 3, 203), "JORNADA NACIONAL DE LUCHA", fill=(0, 0, 0), font=font_big)
draw.text((tx, 200), "JORNADA NACIONAL DE LUCHA", fill=ROJO, font=font_big)

# Línea roja
for x in range(tx, 1050):
    y_l = 270
    r = 220 - int(80 * (x - tx) / (1050 - tx))
    draw.line([(x, y_l), (x, y_l + 3)], fill=(r, 20, 20))

# Subtítulo 2
draw.text((tx + 2, 302), "Por la defensa de los derechos laborales CAS", fill=(0, 0, 0), font=font_med)
draw.text((tx, 300), "Por la defensa de los derechos laborales CAS", fill=BLANCO, font=font_med)

# Mensaje final
draw.text((tx + 2, 362), "#UnidadSindical  •  #CASenLucha  •  #SIUTCASJNJ", fill=(0, 0, 0), font=font_sm)
draw.text((tx, 360), "#UnidadSindical  •  #CASenLucha  •  #SIUTCASJNJ", fill=(180, 140, 140), font=font_sm)

# Puños (emoji aproximado con texto)
draw.text((1050, 420), "✊", fill=(220, 50, 50), font=font_big)

img.save(OUT, "PNG")
print(f"Banner de lucha creado: {OUT}")
