import React from 'react';
import { Folder } from '../components/Folder';
import { SnippetCard } from '../components/SnippetCard';
import { PlusIcon, BackArrowIcon } from '../components/Icons';

export const FolderViewPage = ({ folder, parentFolder, onBack, onFolderSelect, onFolderAdd, onFolderDelete, onFolderRename, onSnippetAdd, onSnippetDelete, onSnippetCopy, onSnippetExpand, onAiChat }) => {
    return (
        <div className="animate-fade-in-up">
            <button onClick={onBack} className="page-back-button">
                <BackArrowIcon /> 
                {parentFolder ? `Back to ${parentFolder.name}` : 'Back to All Projects'}
            </button>
            <div className="page-header">
                <h1 style={{ color: 'var(--color-yellow)' }}>{folder.name}</h1>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={() => onFolderAdd(folder.id)} className="btn btn-yellow">
                        <PlusIcon /> New Subfolder
                    </button>
                    <button onClick={() => onSnippetAdd(folder.id)} className="btn btn-cyan">
                        <PlusIcon /> New Snippet
                    </button>
                </div>
            </div>

            {/* Render Subfolders */}
            {folder.subfolders && folder.subfolders.length > 0 && (
                <>
                    <h2 className="section-title">Subfolders</h2>
                    {folder.subfolders.map(subfolder => (
                        <Folder 
                            key={subfolder.id}
                            folder={subfolder}
                            onFolderSelect={onFolderSelect} // Allow clicking into subfolders
                            onFolderDelete={onFolderDelete}
                            onFolderRename={onFolderRename}
                        />
                    ))}
                </>
            )}

            {/* Render Snippets */}
            {folder.snippets && folder.snippets.length > 0 && (
                <>
                    <h2 className="section-title">Snippets</h2>
                    <div className="snippet-grid">
                        {folder.snippets.map(snippet => (
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
                </>
            )}
        </div>
    );
};
