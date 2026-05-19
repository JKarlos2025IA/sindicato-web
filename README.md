# Sindicato Único de Trabajadores CAS - JNJ

Sitio web del **SIUTCASJNJ** — Junta Nacional de Justicia, Lima, Perú.

> Gestión 2026-2028

## Estructura del Proyecto

```
sindicato-web/
├── README.md              ← Este archivo
├── 00_public/             ← Páginas web (HTML)
│   ├── index.html         ← Página principal
│   ├── admin.html         ← Panel de administración
│   ├── sec_*.html         ← Páginas de secretarías (10)
│   ├── campeonato_2026.html
│   └── formulario_campeonato.html
├── 01_scripts/            ← JavaScript
│   ├── script.js          ← Lightbox, popup, animaciones, cumpleaños
│   └── datos_socios.js    ← Datos de socios (fallback local)
├── 02_assets/             ← Imágenes y fotos
│   ├── img/               ← Logos de equipos, banners
│   ├── photos/            ← Fotos de eventos
│   ├── ANUNCIO_PORTADA_02.png
│   └── miembros.jpg
├── 03_docs/               ← Documentación
│   ├── docs/img/          ← Logo, portadas, navidad
│   ├── 00_CONTEXTO_PROYECTO.md
│   ├── 03_PENDIENTES.md
│   └── 04_SESIONES.md
└── 04_utils/              ← Utilidades
    ├── push.bat           ← Commit + push a GitHub
    └── ver_cambios.bat    ← Abrir vista previa local
```

## Tecnologías

- **Frontend:** HTML + Tailwind CSS (CDN) + JavaScript vanilla
- **Backend:** Firebase (Firestore + Storage + Auth)
- **Deploy:** GitHub Pages (estático)

## Panel de Administración

Accede a `00_public/admin.html` para gestionar:

| Módulo | Función |
|--------|---------|
| **Portadas** | Subir/reordenar imágenes del carrusel principal |
| **Cultura y Deportes** | Subir documentos (bases, fichas, resultados) |
| **Galería** | Crear actividades y subir fotos |
| **Secretarías** | Editar titulares, descripciones, agregar nuevas |
| **Socios** | CRUD completo con búsqueda y cumpleaños |
| **Configuración** | Título, dirección, email, footer, gestión |

> Al primer login, el sistema carga automáticamente los datos iniciales (10 secretarías, 17 socios, configuración) en Firebase.

## Flujo de Trabajo

1. **Editar contenido:** Usa el panel admin (`admin.html`) — no toques código
2. **Ver cambios localmente:** Ejecuta `04_utils\ver_cambios.bat`
3. **Publicar:** Ejecuta `04_utils\push.bat` (requiere autenticación GitHub)

## Firebase

Proyecto: **sindicato-jnj**

Colecciones Firestore:
- `portadas` — Imágenes del carrusel
- `documentos_cultura` — Archivos de cultura/deportes
- `actividades` — Títulos de actividades de galería
- `fotos` — Fotos vinculadas a actividades
- `secretarias` — Datos de cada secretaría
- `socios` — Lista de socios y cumpleaños
- `config_site` — Configuración general del sitio

## Contacto

- **Email:** sindicatocasjnj@gmail.com
- **Dirección:** Av. Paseo de la Republica N° 3285, San Isidro, Lima
