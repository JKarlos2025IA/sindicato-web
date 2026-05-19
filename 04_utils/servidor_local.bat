@echo off
echo =======================================
echo Servidor local - Sindicato Web
echo =======================================
echo.
echo Abriendo en el navegador...
echo Presiona Ctrl+C para detener el servidor
echo.
start "" "http://localhost:8000/00_public/index.html"
cd ..
python -m http.server 8000
pause
