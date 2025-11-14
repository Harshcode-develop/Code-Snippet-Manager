import React from 'react';
import { Folder } from '../components/Folder';
import { PlusIcon } from '../components/Icons';

export const ProjectsPage = ({ userData, onFolderSelect, onFolderAdd, onFolderDelete, onFolderRename }) => {
    return (
        <div className="page-container animate-fade-in-up">
            <div className="page-header">
                <h1>Projects</h1>
                <button onClick={() => onFolderAdd(null)} className="btn btn-yellow">
                    <PlusIcon /> New Project Folder
                </button>
            </div>
            <div className="scrollable-content">
                {userData.folders && userData.folders.length > 0 ? (
                    userData.folders.map(folder => (
                        <Folder 
                            key={folder.id} 
                            folder={folder} 
                            onFolderSelect={onFolderSelect}
                            onFolderDelete={onFolderDelete}
                            onFolderRename={onFolderRename}
                        />
                    ))
                ) : (
                    <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginTop: '2.5rem' }}>
                        No projects found. Create one to get started.
                    </p>
                )}
            </div>
        </div>
    );
};
