// src/components/ChatBox.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../contexts/GameContext';

const ChatBox = () => {
    const [message, setMessage] = useState('');
    const { chatMessages, sendChatMessage, gameState } = useGame();
    const chatEndRef = useRef(null);

    const handleSend = (e) => {
        e.preventDefault();
        if (message.trim()) {
            sendChatMessage(message);
            setMessage('');
        }
    };

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

    return (
        <div className="chat-box">
            <div className="chat-messages">
                {chatMessages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`message ${msg.sender === gameState.role ? 'sent' : 'received'}`}
                    >
                        <span className="message-content">{msg.content}</span>
                        <span className="message-time">
              {new Date(msg.timestamp).toLocaleTimeString()}
            </span>
                    </div>
                ))}
                <div ref={chatEndRef} />
            </div>
            <form className="chat-input" onSubmit={handleSend}>
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Escribe tu mensaje..."
                />
                <button type="submit">Enviar</button>
            </form>
        </div>
    );
};

export default ChatBox;