// src/components/DefuserView.jsx
import React from 'react';
import { useParams } from 'react-router-dom';
import { useGame } from '../contexts/GameContext';
import Timer from './Timer';
import ChatBox from './ChatBox';
import BombModule from './BombModule';

const DefuserView = () => {
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

    return (
        <div className="defuser-container">
            <div className="game-header">
                <h2>Vista del Desactivador - Juego {gameId}</h2>
                <div className="status-bar">
                    <Timer />
                    <div className="strikes">
                        Errores: {Array(gameState.strikes).fill('X').join('')}
                    </div>
                </div>
            </div>

            <div className="main-content">
                <div className="bomb-container">
                    {gameState.modules.map(module => (
                        <BombModule
                            key={module.id}
                            module={module}
                        />
                    ))}
                </div>

                <ChatBox />
            </div>
        </div>
    );
};

export default DefuserView;