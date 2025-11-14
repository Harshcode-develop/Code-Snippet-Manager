import React from 'react';
import { CopyIcon, TrashIcon, SparklesIcon } from './Icons';
import { CodeSyntaxHighlighter } from './CodeSyntaxHighlighter';

export const SnippetCard = ({ snippet, onCopy, onDelete, onExpand, onAiChat }) => {
    return (
        <div className="snippet-card" onClick={() => onExpand(snippet)}>
            <div className="snippet-card-header">
                <h3>{snippet.title}</h3>
                <div className="snippet-card-actions">
                    <button 
                        onClick={(e) => { 
                            e.stopPropagation(); // Prevents the modal from opening
                            onCopy(snippet.code); 
                        }}
                        title="Copy code"
                    >
                        <CopyIcon style={{ width: '1rem', height: '1rem' }} />
                    </button>
                    <button 
                        className="btn-delete" 
                        onClick={(e) => { 
                            e.stopPropagation(); // Prevents the modal from opening
                            onDelete(snippet.id); 
                        }}
                        title="Delete snippet"
                    >
                        <TrashIcon style={{ width: '1rem', height: '1rem' }} />
                    </button>
                </div>
            </div>
            <div className="snippet-card-preview">
                 <CodeSyntaxHighlighter code={snippet.code} />
            </div>
            {/* New AI Chat Button */}
            <button 
                className="snippet-card-ai-btn" 
                onClick={(e) => { e.stopPropagation(); onAiChat(snippet); }}
                title="Ask AI about this snippet"
            >
                <SparklesIcon style={{ width: '1.25rem', height: '1.25rem' }} />
            </button>
        </div>
    );
};
