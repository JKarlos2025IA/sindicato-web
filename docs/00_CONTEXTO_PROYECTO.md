# CONTEXTO DEL PROYECTO: SIUTCASJNJ Website

## INFORMACION GENERAL
- **Proyecto:** Sitio Web Institucional SIUTCASJNJ
- **Proposito:** Plataforma informativa para el Sindicato Único de Trabajadores CAS de la Junta Nacional de Justicia.
- **Stack Tecnologico:**
  - Frontend: HTML5, Tailwind CSS (via CDN), JavaScript Vanilla.
  - Hosting: Netlify (previsto).
  - Versionamiento: Git/GitHub.
- **Repositorio:** https://github.com/JKarlos2025IA/sindicato-web.git
- **Ubicacion Local:** `C:\Users\USUARIO\.gemini\antigravity\scratch\SINDICATO`

## ESTADO ACTUAL
- **Fase:** Mantenimiento / Producción
- **Version:** v1.0-stable
- **Estado del Codigo:** Estable. Se han corregido regresiones visuales críticas y errores de duplicación de código.
- **Ultima Modificacion:** 30 de Noviembre 2025 (Fix visuales y tag v1.0-stable).

## ESTRUCTURA DEL PROYECTO
- `index.html`: Página de inicio (Landing Page) con Hero section, Banner de cumpleaños y accesos a secretarías.
- `sec_*.html`: 10 páginas internas correspondientes a cada secretaría (General, Defensa, Economía, etc.).
- `script.js`: Lógica principal (Banner de cumpleaños, Lightbox, Animaciones fade-in).
- `datos_socios.js`: Base de datos simulada de socios (JSON array).
- `docs/`: Documentación del proyecto (Contexto, Sesiones, Pendientes).

## DECISIONES TECNICAS RECIENTES
1. **Tailwind via CDN:** Se mantiene el uso de CDN para simplicidad, sin build step complejo.
2. **Lightbox Vanilla:** Se implementó un lightbox personalizado en `script.js` para evitar dependencias externas pesadas.
3. **Overlay Transparente:** Se cambió el overlay de la imagen principal de "vainilla" a transparente por petición de diseño.
4. **Git Tagging:** Se estableció `v1.0-stable` como punto de restauración seguro.

## SIGUIENTES PASOS
1. Desplegar cambios recientes a Netlify.
2. Verificar funcionamiento en dispositivos móviles (Responsive design).
3. Evaluar necesidad de formulario de contacto funcional (Backend o servicio como Netlify Forms).
