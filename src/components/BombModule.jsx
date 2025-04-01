import React, { useState, useRef } from 'react';
import { useGame } from '../contexts/GameContext';

const BombModule = ({ module }) => {
    const { solveModule, addStrike, gameState } = useGame();
    const [attempt, setAttempt] = useState('');
    const [localWires, setLocalWires] = useState(module.wires || []);
    const [isHolding, setIsHolding] = useState(false);
    const [pressedButtons, setPressedButtons] = useState([]);
    const [isError, setIsError] = useState(false);
    const holdTimerRef = useRef(null);
    const errorTimerRef = useRef(null);

    const handleSolve = () => {
        if (module.solved) return;

        // This is a simple simulation - in reality, each module would have its own solving logic
        console.log(`Attempting to solve with answer: ${attempt}, solution: ${module.solution}`);
        if (attempt === module.solution) {
            solveModule(module.id);
        } else {
            addStrike();
            setAttempt('');
            setIsHolding(false);

            // Reset local wire state on wrong attempt
            if (module.type === 'wires') {
                setLocalWires(module.wires.map(wire => ({ ...wire, cut: false })));
            }
        }
    };

    // Handle button release based on color and timer
    const handleButtonRelease = () => {
        console.log('Button released with timer:', gameState.timeRemaining);
        console.log('Button color:', module.color);
        console.log('Full module:', module);
        
        // Convert seconds to MM:SS format
        const minutes = Math.floor(gameState.timeRemaining / 60);
        const seconds = gameState.timeRemaining % 60;
        const timeDisplay = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        console.log('Time display:', timeDisplay);
        
        if (module.color === 'blue') {
            // For blue button, release when time display has a 4
            const hasFour = timeDisplay.includes('4');
            console.log('Blue button check - has 4:', hasFour, 'Time:', timeDisplay);
            if (hasFour) {
                solveModule(module.id);
            } else {
                addStrike();
            }
        } else if (module.color === 'yellow') {
            // For yellow button, release when time display has a 5
            const hasFive = timeDisplay.includes('5');
            console.log('Yellow button check - has 5:', hasFive, 'Time:', timeDisplay);
            if (hasFive) {
                solveModule(module.id);
            } else {
                addStrike();
            }
        } else if (module.color === 'red') {
            // For red button, just press and release
            console.log('Red button - solving immediately');
            solveModule(module.id);
        }
        setIsHolding(false);
        clearTimeout(holdTimerRef.current);
    };

    // Render different modules based on type
    const renderModuleContent = () => {
        switch (module.type) {
            case 'wires':
                return (
                    <div className="module-wires">
                        {(localWires || []).map((wire, idx) => (
                            <div
                                key={idx}
                                className={`wire ${wire.color} ${wire.cut ? 'cut' : ''}`}
                                onClick={() => {
                                    if (module.solved || wire.cut) return;

                                    setAttempt(idx.toString());

                                    // Update local wire state for visual feedback
                                    const updatedWires = [...localWires];
                                    updatedWires[idx] = { ...wire, cut: true };
                                    setLocalWires(updatedWires);
                                }}
                            />
                        ))}
                    </div>
                );

            case 'button':
                return (
                    <div className="module-button">
                        <button
                            className={`big-button ${module.color} ${isHolding ? 'holding' : ''}`}
                            onMouseDown={() => {
                                console.log('Button pressed');
                                setIsHolding(true);
                            }}
                            onMouseUp={() => {
                                console.log('Button released');
                                handleButtonRelease();
                            }}
                            onMouseLeave={() => {
                                if (isHolding) {
                                    console.log('Mouse left while holding');
                                    handleButtonRelease();
                                }
                            }}
                        >
                            {module.label}
                        </button>
                    </div>
                );

            case 'keypad':
                const sequences = [
                    ['Ϙ', 'ϗ', 'Ͽ', 'ϡ', 'Ͼ', 'Ϟ'],
                    ['Ϟ', 'ϗ', 'Ϛ', 'ϡ', 'Ͽ', 'Ͼ'],
                    ['Ϛ', 'Ͼ', 'Ϟ', 'ϡ', 'ϗ', 'Ϙ']
                ];

                const checkSequence = (currentSequence) => {
                    return sequences.some(sequence => {
                        // Create a filtered sequence that only includes symbols that appear in the module
                        const filteredSequence = sequence.filter(symbol => 
                            module.symbols.includes(symbol)
                        );
                        
                        return currentSequence.length === filteredSequence.length && 
                               currentSequence.every((symbol, idx) => symbol === filteredSequence[idx]);
                    });
                };

                const handleKeypadPress = (idx) => {
                    if (module.solved || pressedButtons.includes(idx)) return;

                    const newPressedButtons = [...pressedButtons, idx];
                    const currentSequence = newPressedButtons.map(i => module.symbols[i]);

                    // Check if the current sequence matches the start of any valid sequence
                    const isValidNextPress = sequences.some(sequence => {
                        // Create a filtered sequence that only includes symbols that appear in the module
                        const filteredSequence = sequence.filter(symbol => 
                            module.symbols.includes(symbol)
                        );
                        
                        // Check if current sequence matches the start of filtered sequence
                        return currentSequence.every((symbol, i) => 
                            i < filteredSequence.length && symbol === filteredSequence[i]
                        );
                    });

                    if (!isValidNextPress) {
                        // Wrong button pressed
                        setIsError(true);
                        addStrike();
                        // Reset after 1 second
                        errorTimerRef.current = setTimeout(() => {
                            setIsError(false);
                            setPressedButtons([]);
                        }, 1000);
                        return;
                    }

                    setPressedButtons(newPressedButtons);

                    // Only solve if we've completed a full sequence
                    if (checkSequence(currentSequence)) {
                        solveModule(module.id);
                    }
                };

                return (
                    <div className={`module-keypad ${isError ? 'error' : ''}`}>
                        {module.symbols.map((symbol, idx) => (
                            <button
                                key={idx}
                                className={pressedButtons.includes(idx) ? 'pressed' : ''}
                                onClick={() => handleKeypadPress(idx)}
                            >
                                {symbol}
                            </button>
                        ))}
                    </div>
                );

            default:
                return <div>Unknown module type</div>;
        }
    };

    // Update local wire state when module prop changes
    React.useEffect(() => {
        if (module.type === 'wires' && module.wires) {
            setLocalWires(module.wires);
        }
    }, [module]);

    return (
        <div className={`bomb-module ${module.solved ? 'solved' : ''}`}>
            <h3>{module.name}</h3>
            {renderModuleContent()}
            {!module.solved && module.type === 'wires' && (
                <button onClick={handleSolve} className="submit-btn">
                    Submit
                </button>
            )}
        </div>
    );
};

export default BombModule;