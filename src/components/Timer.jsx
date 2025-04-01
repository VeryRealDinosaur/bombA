// src/components/Timer.jsx
import React from 'react';
import { useGame } from '../contexts/GameContext';

const Timer = () => {
    const { gameState } = useGame();

    // Format time from seconds to MM:SS
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className={`timer ${gameState.timeRemaining < 60 ? 'timer-warning' : ''}`}>
            {formatTime(gameState.timeRemaining)}
        </div>
    );
};

export default Timer;