import React, { useState, useRef, useEffect } from 'react';
import { SparklesIcon } from './Icons';
import { CodeSyntaxHighlighter } from './CodeSyntaxHighlighter';

export const AiChatModal = ({ snippet, isOpen, onClose, onSendQuery, isAiLoading }) => {
    const [prompt, setPrompt] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const chatEndRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            setChatHistory([{ sender: 'ai', text: `Hi! How can I help with "${snippet.title}" today?` }]);
        } else {
            setChatHistory([]);
            setPrompt('');
        }
    }, [isOpen, snippet]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory]);

    const handleSend = async () => {
        if (!prompt.trim() || isAiLoading) return;

        const newHistory = [...chatHistory, { sender: 'user', text: prompt }];
        setChatHistory(newHistory);
        setPrompt('');

        const aiResponse = await onSendQuery(prompt, snippet.code);
        if (aiResponse) {
            setChatHistory(prev => [...prev, { sender: 'ai', text: aiResponse }]);
        } else {
            setChatHistory(prev => [...prev, { sender: 'ai', text: "Sorry, I couldn't get a response. Please try again." }]);
        }
    };

    if (!isOpen || !snippet) return null;

    return (
        <div className="modal-overlay animate-fade-in" onClick={onClose}>
            <div className="ai-chat-modal-content" onClick={e => e.stopPropagation()}>
                <div className="ai-chat-modal-header">
                    <SparklesIcon style={{ width: '1.8rem', height: '1.8rem' }} />
                    <h3>AI Assistant</h3>
                    <button onClick={onClose}>&times;</button>
                </div>
                <div className="ai-chat-modal-body">
                    <div className="ai-chat-code-preview">
                        <CodeSyntaxHighlighter code={snippet.code} />
                    </div>
                    <div className="ai-chat-history">
                        {chatHistory.map((msg, index) => (
                            <div key={index} className={`chat-bubble ${msg.sender}`}>
                                {msg.sender === 'ai' && <SparklesIcon style={{width: '1.25rem', height: '1.25rem', flexShrink: 0}} />}
                                <p>{msg.text}</p>
                            </div>
                        ))}
                        {isAiLoading && <div className="chat-bubble ai"><p>Thinking...</p></div>}
                        <div ref={chatEndRef} />
                    </div>
                </div>
                <div className="ai-chat-modal-footer">
                    <input 
                        type="text" 
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ask about this snippet..."
                        disabled={isAiLoading}
                    />
                    <button onClick={handleSend} disabled={isAiLoading}>Send</button>
                </div>
            </div>
        </div>
    );
};
