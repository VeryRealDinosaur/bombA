@echo off

:: Change to the directory where the script is located
cd /d "%~dp0"

echo Iniciando Servidor del Juego de Desactivación de Bomba...
echo.
echo Para unirse al juego, otros jugadores deben abrir su navegador y visitar:
echo http://%COMPUTERNAME%:3001
echo.
echo Presiona Ctrl+C para detener el servidor
echo.
npm start 