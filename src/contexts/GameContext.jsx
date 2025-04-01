import React, { createContext, useContext, useState, useEffect } from 'react';
import io from 'socket.io-client';

const GameContext = createContext();

export const useGame = () => useContext(GameContext);

export const GameProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [gameState, setGameState] = useState({
        gameId: null,
        role: null, // 'defuser' or 'manual'
        partnerId: null,
        timeRemaining: 300, // 5 minutes in seconds
        modules: [],
        solved: 0,
        strikes: 0,
        gameOver: false,
        winner: false,
    });
    const [chatMessages, setChatMessages] = useState([]);
    const [connectedToServer, setConnectedToServer] = useState(false);
    const [connectionError, setConnectionError] = useState(null);

    useEffect(() => {
        // Determine the server URL based on the environment
        const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const serverUrl = isDevelopment 
            ? 'http://localhost:3001'
            : 'https://bombafinal.onrender.com'; // Replace with your actual server URL

        console.log('Connecting to server:', serverUrl);
        
        const newSocket = io(serverUrl, {
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        newSocket.on('connect', () => {
            console.log('Connected to server with ID:', newSocket.id);
            setConnectedToServer(true);
            setConnectionError(null);
            setSocket(newSocket);
        });

        newSocket.on('connect_error', (error) => {
            console.error('Connection error:', error);
            setConnectedToServer(false);
            setConnectionError('Failed to connect to server. Please check your connection and try again.');
        });

        newSocket.on('disconnect', (reason) => {
            console.log('Disconnected from server:', reason);
            setConnectedToServer(false);
        });

        newSocket.on('gameState', (newState) => {
            console.log('Received game state update:', newState);
            setGameState(prevState => {
                // Only update if this is for our game
                if (newState.gameId !== prevState.gameId) {
                    return prevState;
                }

                // Handle different types of updates
                if (newState.type === 'timerUpdate') {
                    // For timer updates, only update the time
                    return {
                        ...prevState,
                        timeRemaining: newState.timeRemaining
                    };
                } else if (newState.type === 'fullUpdate') {
                    // For full updates, update everything except the timer
                    return {
                        ...prevState,
                        ...newState,
                        timeRemaining: prevState.timeRemaining // Preserve current timer
                    };
                }
                
                // Default case: merge all updates
                return { ...prevState, ...newState };
            });
        });

        newSocket.on('chatMessage', (message) => {
            console.log('Received chat message:', message);
            setChatMessages(prev => [...prev, message]);
        });

        return () => {
            if (newSocket) {
                newSocket.close();
            }
        };
    }, []);

    const joinGame = (gameId, role) => {
        if (socket) {
            console.log(`Joining game ${gameId} as ${role}`);
            socket.emit('joinGame', { gameId, role });

            // Initialize local state for this game
            setGameState(prev => ({
                ...prev,
                gameId,
                role
            }));

            // Clear previous chat messages when joining a new game
            setChatMessages([]);
        } else {
            console.error('Cannot join game: socket not connected');
        }
    };

    const sendChatMessage = (content) => {
        if (socket && gameState.gameId) {
            const message = {
                gameId: gameState.gameId,
                sender: gameState.role,
                content,
                timestamp: new Date().toISOString()
            };
            console.log('Sending chat message:', message);
            socket.emit('chatMessage', message);

            // Don't add to local state yet - wait for server to broadcast it back
            // This ensures consistent ordering of messages
        } else {
            console.error('Cannot send message: socket not connected or game not joined');
        }
    };

    const solveModule = (moduleId) => {
        if (socket && gameState.gameId) {
            console.log(`Attempting to solve module ${moduleId}`);
            socket.emit('solveModule', { gameId: gameState.gameId, moduleId });
        } else {
            console.error('Cannot solve module: socket not connected or game not joined');
        }
    };

    const addStrike = () => {
        if (socket && gameState.gameId) {
            console.log('Adding strike');
            socket.emit('addStrike', { gameId: gameState.gameId });
        } else {
            console.error('Cannot add strike: socket not connected or game not joined');
        }
    };

    const value = {
        socket,
        gameState,
        chatMessages,
        connectedToServer,
        connectionError,
        joinGame,
        sendChatMessage,
        solveModule,
        addStrike,
    };

    return (
        <GameContext.Provider value={value}>
            {children}
        </GameContext.Provider>
    );
};
