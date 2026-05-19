@echo off
echo =======================================
echo Guardando cambios en GitHub...
echo Repositorio: https://github.com/JKarlos2025IA/sindicato-web.git
echo =======================================

git add .

set /p commitMsg="Introduce el mensaje del commit (Enter para usar 'Actualizacion automatica'): "
if "%commitMsg%"=="" set commitMsg=Actualizacion automatica

git commit -m "%commitMsg%"

echo Subiendo al repositorio...
git push origin main

echo.
echo Proceso de subida terminado.
pause
