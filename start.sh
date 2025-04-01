#!/bin/bash

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Change to the project directory
cd "$SCRIPT_DIR"

echo "Iniciando Servidor del Juego de Desactivación de Bomba..."
echo
echo "Para unirse al juego, otros jugadores deben abrir su navegador y visitar:"
echo "http://$(hostname):3001"
echo
echo "Presiona Ctrl+C para detener el servidor"
echo
npm start 