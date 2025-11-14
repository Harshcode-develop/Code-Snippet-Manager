import React from 'react';
import { SnippetCard } from '../components/SnippetCard';
import { PlusIcon, BackArrowIcon } from '../components/Icons';

export const SnippetsPage = ({ userData, onSnippetAdd, onSnippetDelete, onSnippetCopy, onSnippetExpand, onAiChat, setPage }) => {
    return (
        <div className="page-container animate-fade-in-up">
            <div className="page-header">
                <h1>Standalone Snippets</h1>
                 <button onClick={onSnippetAdd} className="btn btn-cyan">
                    <PlusIcon/> New Snippet
                </button>
            </div>
            <div className="scrollable-content">
                {userData.standaloneSnippets && userData.standaloneSnippets.length > 0 ? (
                    <div className="snippet-grid">
                        {userData.standaloneSnippets.map(snippet => (
                            <SnippetCard 
                                key={snippet.id} 
                                snippet={snippet} 
                                onCopy={onSnippetCopy} 
                                onDelete={() => onSnippetDelete(snippet.id)} 
                                onExpand={onSnippetExpand} 
                                onAiChat={onAiChat} 
                            />
                        ))}
                    </div>
                ) : (
                     <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginTop: '2.5rem' }}>
                        No standalone snippets found. Add one or clear your search.
                     </p>
                )}
            </div>
        </div>
    );
};
