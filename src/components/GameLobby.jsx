// src/components/GameLobby.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../contexts/GameContext';

const GameLobby = () => {
    const [gameId, setGameId] = useState('');
    const [role, setRole] = useState('');
    const { joinGame, connectedToServer } = useGame();
    const navigate = useNavigate();

    const handleJoin = (e) => {
        e.preventDefault();
        if (gameId && role) {
            joinGame(gameId, role);
            navigate(`/${role}/${gameId}`);
        }
    };

    if (!connectedToServer) {
        return <div className="lobby">Conectando al servidor...</div>;
    }

    return (
        <div className="lobby">
            <h1>Keep Talking Clone</h1>
            <form onSubmit={handleJoin}>
                <div>
                    <label>
                        ID del Juego:
                        <input
                            type="text"
                            value={gameId}
                            onChange={(e) => setGameId(e.target.value)}
                            required
                        />
                    </label>
                </div>
                <div>
                    <label>
                        Rol:
                        <select value={role} onChange={(e) => setRole(e.target.value)} required>
                            <option value="">Selecciona un rol</option>
                            <option value="defuser">Desactivador</option>
                            <option value="manual">Lector del Manual</option>
                        </select>
                    </label>
                </div>
                <button type="submit">Unirse al Juego</button>
            </form>
        </div>
    );
};

export default GameLobby;