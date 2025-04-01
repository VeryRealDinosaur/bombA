import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors());
app.use(express.static(join(__dirname, '../dist')));

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // In production, restrict this to your frontend URL
        methods: ["GET", "POST"]
    }
});

// Game state storage
const games = {};

// Generate a random module for demo purposes
const generateModule = (id, type) => {
    switch (type) {
        case 'wires': {
            const wireColors = ['red', 'blue', 'yellow', 'white', 'black'];
            const wires = Array(4).fill().map(() => ({
                color: wireColors[Math.floor(Math.random() * wireColors.length)],
                cut: false
            }));

            // Determine which wire to cut based on the rules
            let solution;
            const hasRedWires = wires.some(wire => wire.color === 'red');
            const lastWire = wires[wires.length - 1];
            const blueWires = wires.filter(wire => wire.color === 'blue');

            if (!hasRedWires) {
                // If there are no red wires, cut the second wire
                solution = '1';
            } else if (lastWire.color === 'white') {
                // If the last wire is white, cut the last wire
                solution = (wires.length - 1).toString();
            } else if (blueWires.length > 1) {
                // If there is more than one blue wire, cut the last blue wire
                const lastBlueIndex = wires.map((wire, idx) => wire.color === 'blue' ? idx : -1)
                    .filter(idx => idx !== -1)
                    .pop();
                solution = lastBlueIndex.toString();
            } else {
                // Otherwise, cut the last wire
                solution = (wires.length - 1).toString();
            }

            return {
                id,
                type,
                name: 'Wires',
                wires,
                solution,
                solved: false
            };
        }

        case 'button': {
            const buttonColors = ['red', 'blue', 'yellow', 'white'];
            const buttonLabels = ['ABORT', 'DETONATE', 'HOLD', 'PRESS'];
            const indicators = ['CAR', 'FRK', 'BOB', 'NSA', 'MSA', 'SIG', 'CLR', 'TRN', 'NLL', 'IND'];
            
            // Generate random button properties
            const color = buttonColors[Math.floor(Math.random() * buttonColors.length)];
            const label = buttonLabels[Math.floor(Math.random() * buttonLabels.length)];
            
            // Generate random number of batteries (0-5)
            const batteries = Math.floor(Math.random() * 6);
            
            // Randomly decide if there's a lit indicator
            const hasLitIndicator = Math.random() < 0.5;
            const litIndicator = hasLitIndicator ? indicators[Math.floor(Math.random() * indicators.length)] : null;

            // Determine the solution based on the rules
            let solution;
            if (color === 'blue' && label === 'ABORT') {
                solution = 'hold';
            } else if (batteries > 2 && label === 'DETONATE') {
                solution = 'press';
            } else if (color === 'white' && litIndicator === 'CAR') {
                solution = 'hold';
            } else if (batteries > 2 && litIndicator === 'FRK') {
                solution = 'press';
            } else if (color === 'yellow') {
                solution = 'hold';
            } else if (color === 'red' && label === 'HOLD') {
                solution = 'press';
            } else {
                solution = 'hold';
            }

            return {
                id,
                type,
                name: 'Button',
                color,
                label,
                batteries,
                litIndicator,
                solution,
                solved: false
            };
        }

        case 'keypad': {
            const symbols = ['Ϙ', 'ϗ', 'Ͽ', 'ϡ', 'Ͼ', 'Ϟ'];
            // Shuffle and take 4 symbols
            const shuffled = [...symbols].sort(() => 0.5 - Math.random()).slice(0, 4);
            return {
                id,
                type,
                name: 'Keypad',
                symbols: shuffled,
                solution: '0123', // Order to press the symbols
                solved: false
            };
        }
    }
};

// Create a new game
const createGame = (gameId) => {
    const moduleTypes = ['wires', 'button', 'keypad'];

    // Create 3 random modules (one of each type)
    const modules = moduleTypes.map((type, index) =>
        generateModule(`module-${index}`, type)
    );

    return {
        gameId,
        players: {},
        timeRemaining: 300, // 5 minutes
        modules,
        solved: 0,
        strikes: 0,
        gameOver: false,
        winner: false,
        timer: null
    };
};

// Socket connection handlers
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('joinGame', ({ gameId, role }) => {
        // Create game if it doesn't exist
        if (!games[gameId]) {
            games[gameId] = createGame(gameId);

            // Start the game timer
            games[gameId].timer = setInterval(() => {
                const game = games[gameId];
                if (!game) return;

                game.timeRemaining--;

                // Check for game over conditions
                if (game.timeRemaining <= 0) {
                    clearInterval(game.timer);
                    game.gameOver = true;
                    game.winner = false;

                    // Create a clean copy of the game state without the timer
                    const { timer, ...cleanGameState } = game;
                    io.to(gameId).emit('gameState', cleanGameState);
                    return;
                }

                // Send timer update to all clients in this game
                io.to(gameId).emit('gameState', {
                    timeRemaining: game.timeRemaining,
                    gameId: gameId,
                    type: 'timerUpdate'
                });
            }, 1000);
        }

        // Join the game room
        socket.join(gameId);

        // Register the player
        games[gameId].players[socket.id] = { role, id: socket.id };

        // Send the initial game state
        const { timer, ...cleanGameState } = games[gameId];
        socket.emit('gameState', {
            ...cleanGameState,
            gameId,
            role,
            type: 'fullUpdate'
        });

        console.log(`Player joined game ${gameId} as ${role}`);
    });

    socket.on('chatMessage', (message) => {
        const { gameId } = message;
        // Broadcast to all players in the game
        io.to(gameId).emit('chatMessage', message);
    });

    socket.on('solveModule', ({ gameId, moduleId }) => {
        const game = games[gameId];
        if (!game || game.gameOver) return;

        // Find the module and mark it solved
        const module = game.modules.find(m => m.id === moduleId);
        if (module && !module.solved) {
            module.solved = true;
            game.solved++;

            // Check if all modules are solved
            if (game.solved === game.modules.length) {
                clearInterval(game.timer);
                game.gameOver = true;
                game.winner = true;
            }

            // Update all clients
            const { timer, ...cleanGameState } = game;
            io.to(gameId).emit('gameState', cleanGameState);
        }
    });

    socket.on('addStrike', ({ gameId }) => {
        const game = games[gameId];
        if (!game || game.gameOver) return;

        game.strikes++;

        // Check for game over (3 strikes)
        if (game.strikes >= 3) {
            clearInterval(game.timer);
            game.gameOver = true;
            game.winner = false;
        }

        // Update all clients
        const { timer, ...cleanGameState } = game;
        io.to(gameId).emit('gameState', cleanGameState);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);

        // Clean up any games this player was in
        Object.keys(games).forEach(gameId => {
            const game = games[gameId];
            if (game.players[socket.id]) {
                delete game.players[socket.id];

                // If no players left, clear the game
                if (Object.keys(game.players).length === 0) {
                    clearInterval(game.timer);
                    delete games[gameId];
                    console.log(`Game ${gameId} was cleaned up`);
                }
            }
        });
    });
});

// Start the server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Players can join at http://localhost:${PORT}`);
});