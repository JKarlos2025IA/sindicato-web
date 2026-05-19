# SIUTCASJNJ — Sindicato Único de Trabajadores CAS - JNJ

Sitio web oficial. Gestión 2026-2028. Lima, Perú.

🌐 **https://sindicatocasjnj.netlify.app**

---

## Estructura

```
sindicato-web/
├── README.md
├── netlify.toml
├── 00_public/                ← Deploy (Netlify)
│   ├── index.html            ← Página principal
│   ├── admin.html            ← Panel de administración
│   ├── script.js             ← Lógica compartida
│   ├── datos_socios.js       ← Datos locales (fallback)
│   ├── assets/               ← Imágenes, fotos, banners
│   │   ├── img/              ← Logos equipos
│   │   ├── fotos/            ← Fotos de secretarios (PNG sin fondo)
│   │   └── photos/           ← Fotos de eventos
│   ├── docs/                 ← Logo y assets del tema
│   │   └── img/              ← logo_new.png, navidad
│   └── paginas/              ← Páginas secundarias
│       ├── sec_*.html        ← 10 páginas de secretarías
│       ├── campeonato_2026.html
│       ├── formulario_campeonato.html
│       ├── actualizar_datos.html
│       └── asignar_fotos.html
├── 01_documentacion/         ← Documentos del proyecto (.md)
└── 02_utilidades/            ← Scripts .bat y herramientas
```

---

## Dashboard (admin.html)

Accede con tu cuenta Firebase. El panel tiene **9 módulos**:

| Módulo | Función |
|--------|---------|
| 📸 Portadas del Carrusel | Subir, ordenar y eliminar imágenes del carrusel principal |
| 📄 Cultura y Deportes | Subir documentos PDF/Word (bases, fichas, resultados) |
| 🖼️ Galería de Fotos | Crear actividades y subir fotos |
| 👥 Secretarías | Editar titulares, descripciones, colores, orden |
| 🎂 Socios / Cumpleaños | CRUD de afiliados con búsqueda |
| ⚙️ Configuración Web | Título, subtítulo, dirección, email, footer |
| 🎨 Tema Visual | Cambiar tema: Normal, Navidad, Fiestas Patrias, Verano |
| 📢 Banner de Anuncios | Aviso urgente en homepage con toggle y botón de acción |
| 📅 Próximos Eventos | Crear, editar y eliminar eventos con imagen personalizada |

---

## Homepage

1. 🎠 **Carrusel** — imágenes rotativas (300px móvil / 450px escritorio)
2. 🎨 **Banner temático** — cambia según el tema (Navidad, Fiestas, Verano)
3. 📢 **Banner de anuncios** — controlado desde el dashboard
4. 👥 **Junta Directiva** — 10 tarjetas con foto, nombre y descripción
5. ⚽ **Próximos Eventos** — últimos 3 eventos con imagen
6. 🖼️ **Galería Preview** — 6 últimas fotos + link "Ver galería completa"
7. 🔻 **Footer** — dirección, email, gestión, acceso admin

---

## Tecnologías

- **Frontend:** HTML + Tailwind CSS (CDN) + JavaScript vanilla
- **Backend:** Firebase (Firestore + Storage + Auth)
- **Deploy:** Netlify (auto-deploy desde GitHub)

---

## Firebase

Proyecto: **sindicato-jnj**

| Colección | Contenido |
|-----------|-----------|
| `portadas` | Imágenes del carrusel |
| `documentos_cultura` | Archivos PDF/Word |
| `actividades` | Títulos de eventos/actividades |
| `fotos` | Fotos vinculadas a actividades |
| `secretarias` | 10 secretarías con datos y fotos |
| `socios` | 69 afiliados |
| `config_site` | Título, footer, tema, anuncio |

---

## Flujo de trabajo

1. **Editar contenido:** `admin.html` → login → módulo correspondiente
2. **Ver cambios:** `02_utilidades/ver_cambios.bat` (servidor local)
3. **Publicar:** `git push` (Netlify hace deploy automático)

---

## Contacto

- 📧 sindicatocasjnj@gmail.com
- 📍 Av. Paseo de la Republica N° 3285, San Isidro, Lima
