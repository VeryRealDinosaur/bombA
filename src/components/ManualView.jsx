// src/components/ManualView.jsx
import React from 'react';
import { useParams } from 'react-router-dom';
import { useGame } from '../contexts/GameContext';
import Timer from './Timer';
import ChatBox from './ChatBox';

const ManualView = () => {
    const { gameId } = useParams();
    const { gameState } = useGame();

    if (gameState.gameOver) {
        return (
            <div className="game-over">
                <h2>{gameState.winner ? '¡Bomba Desactivada!' : '¡BOOM! Fin del Juego'}</h2>
                <p>Volver al <a href="/">lobby</a> para un nuevo juego.</p>
            </div>
        );
    }

    // This is a simplified view showing static manual content
    // In a full implementation, you would have different manual sections
    return (
        <div className="manual-container">
            <div className="game-header">
                <h2>Lector del Manual - Juego {gameId}</h2>
                <Timer />
            </div>

            <div className="main-content">
                <div className="manual-content">
                    <div className="manual-section">
                        <h3>Instrucciones del Módulo de Cables</h3>
                        <p>Si no hay cables rojos, corta el segundo cable.</p>
                        <p>De lo contrario, si el último cable es blanco, corta el último cable.</p>
                        <p>De lo contrario, si hay más de un cable azul, corta el último cable azul.</p>
                        <p>De lo contrario, corta el último cable.</p>
                    </div>

                    <div className="manual-section">
                        <h3>Instrucciones del Módulo de Botón</h3>
                        <p>Si el botón es azul, mantén presionado y suelta cuando el contador tenga un 4 en cualquier posición.</p>
                        <p>Si el botón es rojo, presiona y suelta inmediatamente.</p>
                        <p>Si el botón es amarillo, mantén presionado y suelta cuando el contador tenga un 5 en cualquier posición.</p>
                    </div>

                    <div className="manual-section">
                        <h3>Instrucciones del Módulo de Teclado</h3>
                        <p>Presiona los símbolos en orden de arriba a abajo según aparezcan en estas secuencias:</p>
                        <p>Secuencia 1: Ϙ, ϗ, Ͽ, ϡ, Ͼ, Ϟ</p>
                        <p>Secuencia 2: Ϟ, ϗ, Ϛ, ϡ, Ͽ, Ͼ</p>
                        <p>Secuencia 3: Ϛ, Ͼ, Ϟ, ϡ, ϗ, Ϙ</p>
                    </div>
                </div>

                <ChatBox />
            </div>
        </div>
    );
};

export default ManualView;