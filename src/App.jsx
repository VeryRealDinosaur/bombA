import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { GameProvider } from './contexts/GameContext';
import GameLobby from './components/GameLobby';
import DefuserView from './components/DefuserView';
import ManualView from './components/ManualView';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
    return (
        <ErrorBoundary>
            <GameProvider>
                <Router>
                    <Routes>
                        <Route path="/" element={<GameLobby />} />
                        <Route path="/defuser/:gameId" element={<DefuserView />} />
                        <Route path="/manual/:gameId" element={<ManualView />} />
                    </Routes>
                </Router>
            </GameProvider>
        </ErrorBoundary>
    );
}

export default App;