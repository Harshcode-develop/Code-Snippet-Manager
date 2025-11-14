import React, { useState, useEffect } from 'react';
import { SparklesIcon, CopyIcon, PencilIcon } from './Icons';
import { CodeSyntaxHighlighter } from './CodeSyntaxHighlighter';

export const SnippetViewModal = ({ snippet, isOpen, onClose, onCopy, onUpdate, onAiAction, isAiLoading }) => { 
    const [currentCode, setCurrentCode] = useState(''); 
    const [currentTitle, setCurrentTitle] = useState(''); 
    const [aiAnalysis, setAiAnalysis] = useState(''); 
    const [isEditing, setIsEditing] = useState(false);
    
    useEffect(() => { 
        if (snippet) { 
            setCurrentCode(snippet.code); 
            setCurrentTitle(snippet.title); 
            setAiAnalysis(''); 
            setIsEditing(false);
        } 
    }, [snippet]); 
    
    const handleAiAction = async (action) => { 
        setAiAnalysis(''); 
        const result = await onAiAction(action, currentCode); 
        if (result) { 
            if (action === 'check') { 
                setAiAnalysis(result); 
            } else { 
                setCurrentCode(result); 
            } 
        } 
    }; 
    
    const handleSave = () => { 
        onUpdate(snippet.id, currentTitle, currentCode); 
        onClose(); 
    }; 
    
    if (!isOpen || !snippet) return null; 
    
    return ( 
        <div className="snippet-view-modal-overlay animate-fade-in" onClick={onClose}>
            <div className="snippet-view-modal-content" onClick={e => e.stopPropagation()}>
                <div className="snippet-view-modal-header">
                    <input type="text" value={currentTitle} onChange={(e) => setCurrentTitle(e.target.value)} />
                    <button onClick={onClose}>&times;</button>
                </div>
                <div className="snippet-view-modal-body" onClick={() => setIsEditing(true)}>
                    {isEditing ? (
                        <textarea 
                            value={currentCode} 
                            onChange={(e) => setCurrentCode(e.target.value)} 
                            spellCheck="false"
                            autoFocus
                        />
                    ) : (
                        <CodeSyntaxHighlighter code={currentCode} />
                    )}
                </div>
                {aiAnalysis && ( 
                    <div className="snippet-view-modal-analysis">
                        <h4>AI Analysis:</h4>
                        <p>{aiAnalysis}</p>
                    </div> 
                )}
                <div className="snippet-view-modal-footer">
                    <div className="actions-left">
                        <button onClick={() => handleAiAction('check')} disabled={isAiLoading} className="btn btn-purple">
                            <SparklesIcon style={{ marginRight: '0.5rem' }}/> {isAiLoading ? '...' : 'Check Code'}
                        </button>
                        <button onClick={() => handleAiAction('correct')} disabled={isAiLoading} className="btn btn-indigo">
                            <SparklesIcon style={{ marginRight: '0.5rem' }}/> {isAiLoading ? '...' : 'Correct Code'}
                        </button>
                        <button onClick={() => handleAiAction('add_comments')} disabled={isAiLoading} className="btn btn-indigo">
                            <SparklesIcon style={{ marginRight: '0.5rem' }}/> {isAiLoading ? '...' : 'Add Comments'}
                        </button>
                    </div>
                    <div className="actions-right">
                        <button onClick={() => onCopy(currentCode)} className="btn btn-gray">
                            <CopyIcon style={{ marginRight: '0.5rem' }} /> Copy
                        </button>
                        <button onClick={handleSave} className="btn btn-green">
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div> 
    ); 
};
