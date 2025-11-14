import React, { useState, useMemo } from 'react';
import { SnippetCard } from '../components/SnippetCard';
import { Folder } from '../components/Folder';
import { SearchIcon } from '../components/Icons';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

export const HomePage = ({ userData, onSnippetCopy, onDelete, onExpand, onAiChat, setPage, onFolderSelect }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showRecents, setShowRecents] = useState(true);

    const totalSnippets = (userData.standaloneSnippets?.length || 0) + (userData.folders?.reduce((acc, folder) => acc + folder.snippets.length, 0) || 0);

    const allSnippets = useMemo(() => {
        const snippetsFromFolders = (userData.folders || []).flatMap(folder => 
            folder.snippets ? folder.snippets.map(s => ({...s, folderName: folder.name})) : []
        );
        return [
            ...(userData.standaloneSnippets || []),
            ...snippetsFromFolders
        ];
    }, [userData]);

    // This logic ensures only the 4 most recent snippets are ever shown
    const recentSnippets = useMemo(() => 
        allSnippets.sort((a, b) => b.id - a.id).slice(0, 4), 
        [allSnippets]
    );

    const searchResults = useMemo(() => {
        if (!searchTerm.trim()) {
            return null;
        }
        const lowerCaseTerm = searchTerm.toLowerCase();

        const foundSnippets = allSnippets.filter(snippet => 
            snippet.title.toLowerCase().includes(lowerCaseTerm) || 
            snippet.code.toLowerCase().includes(lowerCaseTerm)
        );

        const foundFolders = (userData.folders || []).filter(folder => 
            folder.name.toLowerCase().includes(lowerCaseTerm)
        );

        return { snippets: foundSnippets, folders: foundFolders };
    }, [searchTerm, allSnippets, userData.folders]);

    const handleFolderClick = (folder) => {
        setPage('projects');
        onFolderSelect(folder);
    };

    return (
        <div className="animate-fade-in-up">
            <div className="home-welcome-section">
                <h1>Welcome, Coder.</h1>
                <div className="lottie-animation-container">
                    <DotLottieReact
                      src="https://lottie.host/42dfe8fe-fcb2-40e9-91c8-3f218311eb13/T5pD6OWyu2.lottie"
                      loop
                      autoplay
                    />
                </div>
                <p>Your personal code snippets manager. All your valuable snippets, one workspace.</p>
                <div className="home-stats-container">
                    <div>
                        <span className="stat-number yellow">{userData.folders?.length || 0}</span>
                        <span className="stat-label">Projects</span>
                    </div>
                    <div>
                        <span className="stat-number cyan">{totalSnippets}</span>
                        <span className="stat-label">Snippets</span>
                    </div>
                </div>
            </div>

            <div className="home-search-container">
                <SearchIcon />
                <input 
                    type="text"
                    className="home-search-input"
                    placeholder="Search all snippets and folders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {searchResults ? (
                <div className="search-results-container">
                    <p className="search-results-summary">
                        Found {searchResults.folders.length} folder(s) and {searchResults.snippets.length} snippet(s).
                    </p>
                    {searchResults.folders.map(folder => (
                        <div key={folder.id} onClick={() => handleFolderClick(folder)}>
                             <Folder folder={folder} onFolderSelect={() => handleFolderClick(folder)} />
                        </div>
                    ))}
                    <div className="snippet-grid">
                        {searchResults.snippets.map(snippet => (
                            <SnippetCard 
                                key={snippet.id} 
                                snippet={snippet} 
                                onCopy={onSnippetCopy} 
                                onDelete={() => onDelete('snippet', snippet.id)} 
                                onExpand={onExpand} 
                                onAiChat={onAiChat} 
                            />
                        ))}
                    </div>
                </div>
            ) : (
                showRecents && recentSnippets.length > 0 && (
                    <div className='recent-snippets-container'>
                        <div className="section-header">
                            <h2 className="section-title">Recent Activity</h2>
                            <button onClick={() => setShowRecents(false)} className="clear-recents-btn">Clear</button>
                        </div>
                        <div className="snippet-grid">
                            {recentSnippets.map(snippet => (
                                <SnippetCard 
                                    key={snippet.id} 
                                    snippet={snippet} 
                                    onCopy={onSnippetCopy} 
                                    onDelete={() => onDelete('snippet', snippet.id)} 
                                    onExpand={onExpand} 
                                    onAiChat={onAiChat} 
                                />
                            ))}
                        </div>
                    </div>
                )
            )}
        </div>
    );
};