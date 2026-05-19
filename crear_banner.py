from PIL import Image, ImageDraw, ImageFont
import os

W, H = 1200, 500
img = Image.new("RGB", (W, H), "#0a1628")

draw = ImageDraw.Draw(img)

# Gradiente manual (barrido vertical)
for y in range(H):
    r = int(10 + (30 - 10) * y / H)
    g = int(22 + (41 - 22) * y / H)
    b = int(40 + (64 - 40) * y / H)
    draw.line([(0, y), (W, y)], fill=(r, g, b))

# Banda naranja
for y in range(420, 500):
    r2 = 234
    g2 = 88 + int(40 * (y - 420) / 80)
    b2 = 12 + int(30 * (y - 420) / 80)
    draw.line([(0, y), (W, y)], fill=(r2, g2 - 30, b2))

# Franja superior
for y in range(0, 8):
    draw.line([(0, y), (W, y)], fill=(234, 88, 12))

# Texto principal
try:
    font_title = ImageFont.truetype("arialbd.ttf", 72)
    font_sub = ImageFont.truetype("arial.ttf", 32)
    font_small = ImageFont.truetype("arial.ttf", 22)
except:
    font_title = ImageFont.load_default()
    font_sub = font_title
    font_small = font_title

# Sombra texto
draw.text((302, 162), "SIUTCASJNJ", fill=(0, 0, 0, 100), font=font_title)
draw.text((300, 160), "SIUTCASJNJ", fill=(255, 255, 255), font=font_title)

draw.text((302, 252), "Sindicato Único de Trabajadores CAS", fill=(0, 0, 0, 80), font=font_sub)
draw.text((300, 250), "Sindicato Único de Trabajadores CAS", fill=(200, 210, 230), font=font_sub)

draw.text((302, 292), "Junta Nacional de Justicia — Gestión 2026-2028", fill=(0, 0, 0, 80), font=font_small)
draw.text((300, 290), "Junta Nacional de Justicia — Gestión 2026-2028", fill=(150, 160, 180), font=font_small)

# Línea decorativa
for x in range(300, 900):
    y_line = 330
    color = (234, 88 + int(50 * (x - 300) / 600), 12)
    draw.line([(x, y_line), (x, y_line + 3)], fill=color)

# Franja inferior con texto
draw.text((312, 442), "Unidad y compromiso por nuestros derechos.", fill=(255, 255, 255), font=font_small)

# Logo sencillo (escudo circular)
cx, cy, r = 150, 250, 55
for angle in range(360):
    import math
    rad = math.radians(angle)
    for t in range(r, r + 4):
        x = cx + t * math.cos(rad)
        y = cy + t * math.sin(rad)
        draw.point((int(x), int(y)), fill=(234, 88, 12))

draw.ellipse([cx - 48, cy - 48, cx + 48, cy + 48], outline=(234, 88, 12), width=4)
draw.ellipse([cx - 52, cy - 52, cx + 52, cy + 52], outline=(255, 255, 255), width=2)

# "S" dentro del círculo
try:
    font_s = ImageFont.truetype("arialbd.ttf", 60)
except:
    font_s = font_title
bbox_s = draw.textbbox((0, 0), "S", font=font_s)
tw, th = bbox_s[2] - bbox_s[0], bbox_s[3] - bbox_s[1]
draw.text((cx - tw//2, cy - th//2 - 5), "S", fill=(255, 255, 255), font=font_s)

OUT = r"C:\Users\juan.montenegro\Desktop\PAGINA WEB-SINDICATO\sindicato-web\00_public\assets\banner_oficial.png"
img.save(OUT, "PNG")
print(f"Banner creado: {OUT}")
print(f"Tamaño: {W}x{H}")
