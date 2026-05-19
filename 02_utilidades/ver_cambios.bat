@echo off
echo =======================================
echo Servidor local - Vista previa
echo =======================================
echo.
echo Abriendo en el navegador...
echo Presiona Ctrl+C para detener el servidor
echo.
start "" "http://localhost:8000/index.html"
cd ..\00_public
python -m http.server 8000
pause
