import React, { useState } from 'react';
import { FolderIcon, TrashIcon, PencilIcon } from './Icons';

export const Folder = ({ folder, onFolderSelect, onFolderDelete, onFolderRename }) => {
    const [isRenaming, setIsRenaming] = useState(false);
    const [newName, setNewName] = useState(folder.name);

    const handleRename = (e) => {
        e.stopPropagation(); // Prevent folder from opening
        if (isRenaming) {
            onFolderRename(folder.id, newName);
            setIsRenaming(false);
        } else {
            setIsRenaming(true);
        }
    };

    return (
        <div className="folder animate-fade-in-up" onClick={() => !isRenaming && onFolderSelect(folder)}>
            <div className="folder-header">
                <div className="folder-title">
                    <FolderIcon style={{ width: '1.5rem', height: '1.5rem', color: 'var(--color-yellow)' }} />
                    {isRenaming ? (
                        <input 
                            type="text" 
                            className="folder-rename-input"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            autoFocus
                        />
                    ) : (
                        <h2>{folder.name}</h2>
                    )}
                </div>
                <div className="folder-actions">
                     <button onClick={handleRename} className="btn-rename">
                        {isRenaming ? 'Save' : <PencilIcon style={{ width: '1.25rem', height: '1.25rem' }} />}
                     </button>
                     <button onClick={(e) => { e.stopPropagation(); onFolderDelete(folder.id); }} className="btn-delete">
                        <TrashIcon style={{ width: '1.25rem', height: '1.25rem' }} />
                    </button>
                </div>
            </div>
        </div>
    );
};
