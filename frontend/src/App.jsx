import React, { useState, useEffect, useMemo } from 'react';

// Import CSS and Components
import './App.css'; 
import AuthPage from './pages/AuthPage';
import { HomePage } from './pages/HomePage';
import { ProjectsPage } from './pages/ProjectsPage';
import { SnippetsPage } from './pages/SnippetsPage';
import { FolderViewPage } from './pages/FolderViewPage';
import { Navbar } from './components/Navbar';
import { Notification } from './components/Notification';
import { Modal } from './components/Modal';
import { SnippetViewModal } from './components/SnippetViewModal';
import { AiChatModal } from './components/AiChatModal';
import { ConfirmModal } from './components/ConfirmModal';
import { SparklesIcon } from './components/Icons';

const API_URL = 'http://localhost:5000/api';

export default function App() {
    const [page, setPage] = useState('login');
    const [token, setToken] = useState(sessionStorage.getItem('authToken'));
    const [userData, setUserData] = useState({ folders: [], standaloneSnippets: [] });
    const [isLoading, setIsLoading] = useState(true);
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    
    const [folderHistory, setFolderHistory] = useState([]);
    const currentFolder = folderHistory.length > 0 ? folderHistory[folderHistory.length - 1] : null;
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('');
    const [targetFolderId, setTargetFolderId] = useState(null);
    const [viewingSnippet, setViewingSnippet] = useState(null);
    const [title, setTitle] = useState('');
    const [code, setCode] = useState('');
    const [folderName, setFolderName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [aiPrompt, setAiPrompt] = useState('');
    const [notification, setNotification] = useState({ message: '', type: '' });
    const [aiChatSnippet, setAiChatSnippet] = useState(null);

    const [confirmModal, setConfirmModal] = useState({ isOpen: false, onConfirm: null, message: '' });

    const findFolderById = (folders, id) => {
        for (const folder of folders) {
            if (folder.id === id) return folder;
            if (folder.subfolders && folder.subfolders.length > 0) {
                const found = findFolderById(folder.subfolders, id);
                if (found) return found;
            }
        }
        return null;
    };

    const apiFetch = async (endpoint, method = 'GET', body = null) => {
        const headers = { 'Content-Type': 'application/json' };
        const currentToken = sessionStorage.getItem('authToken');
        if (currentToken) headers['Authorization'] = `Bearer ${currentToken}`;
        const options = { method, headers };
        if (body) options.body = JSON.stringify(body);
        const response = await fetch(`${API_URL}${endpoint}`, options);
        if (response.status === 204) return null;
        const data = await response.json();
        if (!response.ok) {
            if (response.status === 401 || response.status === 403) handleLogout();
            throw new Error(data.message || `HTTP error! status: ${response.status}`);
        }
        return data;
    };

    const handleGoogleLogin = async (googleResponse) => {
        try {
            const data = await apiFetch('/auth/google', 'POST', { 
                credential: googleResponse.credential 
            });
            sessionStorage.setItem('authToken', data.token);
            setToken(data.token);
            await fetchUserData();
            setPage('home');
            showNotification(data.message, 'success');
        } catch (error) {
            showNotification(error.message, 'error');
        }
    };

    const callGeminiApi = async (prompt) => {
        setIsAiLoading(true);
        try {
            
            const apiKey = "enter_api_key"; 
            
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
            const payload = { contents: [{ parts: [{ text: prompt }] }] };
            const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (!response.ok) throw new Error("Gemini API error");
            const result = await response.json();
            const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!text) throw new Error("AI did not return a valid response.");
            return text.replace(/```[\w\s]*\n/g, '').replace(/```/g, '').trim();
        } catch (error) {
            showNotification(error.message, 'error');
            return null;
        } finally {
            setIsAiLoading(false);
        }
    };


    useEffect(() => {
        const currentToken = sessionStorage.getItem('authToken');
        if (currentToken) {
            setToken(currentToken);
            fetchUserData();
            setPage('home');
        }
        setIsLoading(false);
    }, []);

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification({ message: '', type: '' }), 3000);
    };

    const fetchUserData = async () => {
        try {
            const data = await apiFetch('/data');
            setUserData(data);
            return data;
        } catch (error) {
            console.error("Failed to fetch user data:", error);
            return null;
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const data = await apiFetch('/auth/login', 'POST', { email, password });
            sessionStorage.setItem('authToken', data.token);
            setToken(data.token);
            await fetchUserData();
            setPage('home');
            showNotification(data.message, 'success');
        } catch (error) {
            showNotification(error.message, 'error');
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        try {
            const data = await apiFetch('/auth/signup', 'POST', { email, password });
            showNotification(data.message, 'success');
        } catch (error) {
            showNotification(error.message, 'error');
        }
    };

    const handleLogout = () => {
        sessionStorage.removeItem('authToken');
        setToken(null);
        setUserData({ folders: [], standaloneSnippets: [] });
        setPage('login');
        setFolderHistory([]);
        setEmail('');
        setPassword('');
    };
    
    const resetForm = () => {
        setTitle(''); setCode(''); setFolderName(''); setAiPrompt(''); setIsModalOpen(false);
    };
    
    const handleAddFolder = async () => {
        if (!folderName.trim()) return;
        try {
            await apiFetch('/folders', 'POST', { name: folderName, parentId: targetFolderId });
            const newData = await fetchUserData();
            if (newData && currentFolder) {
                const updatedFolder = findFolderById(newData.folders, currentFolder.id);
                if (updatedFolder) {
                    const newHistory = [...folderHistory];
                    newHistory[newHistory.length - 1] = updatedFolder;
                    setFolderHistory(newHistory);
                }
            }
            resetForm();
            showNotification("Folder created successfully!", "success");
        } catch (error) {
            showNotification(error.message, 'error');
        }
    };

    const handleAddSnippet = async () => {
        if (!title.trim() || !code.trim()) return;
        try {
            await apiFetch('/snippets', 'POST', { title, code, folderId: targetFolderId });
            const newData = await fetchUserData();
            if (newData && currentFolder) {
                const updatedFolder = findFolderById(newData.folders, currentFolder.id);
                if (updatedFolder) {
                    const newHistory = [...folderHistory];
                    newHistory[newHistory.length - 1] = updatedFolder;
                    setFolderHistory(newHistory);
                }
            }
            resetForm();
            showNotification("Snippet created successfully!", "success");
        } catch (error) {
            showNotification(error.message, 'error');
        }
    };

    const handleUpdateSnippet = async (snippetId, updatedTitle, updatedCode) => {
        try {
            await apiFetch(`/snippets/${snippetId}`, 'PUT', { title: updatedTitle, code: updatedCode });
            await fetchUserData();
            showNotification("Snippet updated successfully!", "success");
        } catch (error) {
            showNotification(error.message, 'error');
        }
    };
    
    const handleFolderRename = async (folderId, newName) => {
        try {
            await apiFetch(`/folders/${folderId}`, 'PUT', { name: newName });
            const newData = await fetchUserData();
            if (newData && currentFolder) {
                const updatedFolder = findFolderById(newData.folders, currentFolder.id);
                if (updatedFolder) {
                    const newHistory = [...folderHistory];
                    newHistory[newHistory.length - 1] = updatedFolder;
                    setFolderHistory(newHistory);
                }
            }
            showNotification("Folder renamed successfully!", "success");
        } catch (error) {
            showNotification(error.message, 'error');
        }
    };

    const handleDelete = (type, id) => {
        setConfirmModal({
            isOpen: true,
            message: `Are you sure you want to delete this ${type}? This action cannot be undone.`,
            onConfirm: () => {
                confirmDelete(type, id);
                setConfirmModal({ isOpen: false, onConfirm: null, message: '' });
            }
        });
    };
    
    const confirmDelete = async (type, id) => {
        try {
            await apiFetch(`/${type}s/${id}`, 'DELETE');
            const newData = await fetchUserData();
            if (type === 'folder' && currentFolder && currentFolder.id === id) {
                handleBack();
            } else if (newData && currentFolder) {
                const updatedFolder = findFolderById(newData.folders, currentFolder.id);
                if (updatedFolder) {
                    const newHistory = [...folderHistory];
                    newHistory[newHistory.length - 1] = updatedFolder;
                    setFolderHistory(newHistory);
                } else {
                    handleBack();
                }
            }
        } catch (error) {
            showNotification(error.message, 'error');
        }
    };

    const handleFolderSelect = (folder) => {
        setFolderHistory([...folderHistory, folder]);
    };

    const handleBack = () => {
        const newHistory = [...folderHistory];
        newHistory.pop();
        setFolderHistory(newHistory);
    };
    
    const handleGenerateCode = async () => {
        if (!aiPrompt.trim()) return;
        const fullPrompt = `${aiPrompt}. Only return the raw code, with no explanation or markdown formatting.`;
        const generatedCode = await callGeminiApi(fullPrompt);
        if (generatedCode) {
            setCode(generatedCode);
            if (!title) setTitle(aiPrompt.substring(0, 50));
        }
    };

    const handleAiSnippetAction = async (action, codeToProcess) => {
        let prompt = '';
        switch(action) {
            case 'check':
                // New prompt to ask the AI to identify the erroneous line
                prompt = `Analyze the following code snippet and identify the single line that contains the most significant error or bug. Return ONLY that single line of code, with no explanation, markdown, or any other text.\n\n${codeToProcess}`;
                break;
            case 'correct':
                prompt = `Correct the following code snippet. Fix any bugs or errors. Only return the raw, corrected code with no explanation or markdown formatting.\n\n${codeToProcess}`;
                break;
            case 'add_comments':
                prompt = `Add clear and descriptive comments to the following code snippet where necessary. Do not change the code logic. Only return the raw, updated code with no explanation or markdown formatting.\n\n${codeToProcess}`;
                break;
            default:
                return null;
        }
        return await callGeminiApi(prompt);
    };

    const handleAiChatQuery = async (userPrompt, code) => {
        const fullPrompt = `You are a helpful coding assistant. A user has a code snippet and a question about it. Provide a concise and helpful answer.\n\nCode Snippet:\n---\n${code}\n---\n\nUser's Question: "${userPrompt}"`;
        return await callGeminiApi(fullPrompt); // Use fullPrompt, not prompt
    };
    
    const openModal = (mode, id = null) => {
        setModalMode(mode);
        setTargetFolderId(id);
        setIsModalOpen(true);
    };

    const filteredData = useMemo(() => {
        if (!searchTerm) return userData;
        const lower = searchTerm.toLowerCase();
        
        const filterSnippets = (snippets) => snippets.filter(s => s.title.toLowerCase().includes(lower) || s.code.toLowerCase().includes(lower));
        
        const filterFolders = (folders) => {
            return folders.map(folder => {
                const matchingSnippets = filterSnippets(folder.snippets);
                const matchingSubfolders = filterFolders(folder.subfolders);
                
                if (folder.name.toLowerCase().includes(lower) || matchingSnippets.length > 0 || matchingSubfolders.length > 0) {
                    return { ...folder, snippets: matchingSnippets, subfolders: matchingSubfolders };
                }
                return null;
            }).filter(Boolean);
        };

        const filteredStandalone = userData.standaloneSnippets?.filter(s => s.title.toLowerCase().includes(lower) || s.code.toLowerCase().includes(lower)) || [];
        const filteredFoldersResult = filterFolders(userData.folders || []);

        return { standaloneSnippets: filteredStandalone, folders: filteredFoldersResult };
    }, [searchTerm, userData]);

    if (isLoading) return <div className="text-center text-xl text-white">Loading...</div>;

    const renderPage = () => {
        if (currentFolder) {
            const parentFolder = folderHistory.length > 1 ? folderHistory[folderHistory.length - 2] : null;
            return <FolderViewPage 
                        folder={currentFolder} 
                        parentFolder={parentFolder}
                        onBack={handleBack}
                        onFolderSelect={handleFolderSelect}
                        onFolderAdd={(parentId) => openModal('addFolder', parentId)} 
                        onFolderDelete={(id) => handleDelete('folder', id)} 
                        onFolderRename={handleFolderRename}
                        onSnippetAdd={(folderId) => openModal('addSnippetToFolder', folderId)} 
                        onSnippetDelete={(snippetId) => handleDelete('snippet', snippetId)} 
                        onSnippetCopy={(code) => navigator.clipboard.writeText(code)} 
                        onSnippetExpand={setViewingSnippet} 
                        onAiChat={setAiChatSnippet}
                    />;
        }

        switch(page) {
            case 'home':
                return <HomePage 
                            userData={userData} 
                            onSnippetCopy={(code) => navigator.clipboard.writeText(code)}
                            onDelete={handleDelete}
                            onExpand={setViewingSnippet}
                            onAiChat={setAiChatSnippet}
                            setPage={setPage} // Pass this function
                            onFolderSelect={handleFolderSelect} // Pass this function
                        />;

            case 'projects':
                return <ProjectsPage userData={filteredData} onFolderSelect={handleFolderSelect} onFolderAdd={(parentId) => openModal('addFolder', parentId)} onFolderDelete={(id) => handleDelete('folder', id)} onFolderRename={handleFolderRename} />;
            case 'snippets':
                return <SnippetsPage userData={filteredData} onSnippetAdd={() => openModal('addSnippet')} onSnippetDelete={(id) => handleDelete('snippet', id)} onSnippetCopy={(code) => navigator.clipboard.writeText(code)} onSnippetExpand={setViewingSnippet} onAiChat={setAiChatSnippet} setPage={setPage} />;
            default:
                return <HomePage userData={userData} />;
        }
    };

    return (
        <div className="app-container">
            {token && <Navbar onLogout={handleLogout} searchTerm={searchTerm} setSearchTerm={setSearchTerm} setPage={setPage} page={page} />}
              <main>
                {!token ? (
                    <AuthPage 
                        onLogin={handleLogin} 
                        onSignup={handleSignup} 
                        onGoogleLogin={handleGoogleLogin} 
                        email={email} 
                        password={password} 
                        setEmail={setEmail} 
                        setPassword={setPassword} 
                    />
                ) : (
                    renderPage()
                )}
            </main>
            <Notification message={notification.message} type={notification.type} />
            <Modal isOpen={isModalOpen} onClose={resetForm}>
                {modalMode === 'addFolder' && (
                    <div>
                        <h3 style={{fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--color-yellow)'}}>New Folder</h3>
                        <input type="text" value={folderName} onChange={e => setFolderName(e.target.value)} placeholder="Folder Name" style={{width: '100%', padding: '0.5rem', backgroundColor: 'var(--color-bg-lighter)', border: '1px solid var(--color-border)', borderRadius: '0.375rem', marginBottom: '1rem', color: 'white', boxSizing: 'border-box'}} />
                        <button onClick={handleAddFolder} style={{width: '100%', padding: '0.5rem', backgroundColor: 'var(--color-yellow)', color: 'black', fontWeight: 'bold', borderRadius: '0.375rem'}}>Create Folder</button>
                    </div>
                )}
                {(modalMode === 'addSnippet' || modalMode === 'addSnippetToFolder') && (
                     <div>
                        <h3 style={{fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--color-cyan)'}}>New Snippet</h3>
                        <div style={{marginBottom: '1rem', padding: '0.75rem', backgroundColor: 'rgba(31, 41, 55, 0.5)', borderRadius: '0.5rem'}}>
                            <label style={{display: 'block', fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--color-purple)'}}>Generate with AI</label>
                            <div style={{display: 'flex', gap: '0.5rem'}}>
                                <input type="text" value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} placeholder="e.g., a python function to sort a list" style={{width: '100%', padding: '0.5rem', backgroundColor: 'var(--color-bg-lighter)', border: '1px solid var(--color-border)', borderRadius: '0.375rem', color: 'white'}} />
                                <button onClick={handleGenerateCode} disabled={isAiLoading} style={{padding: '0 1rem', backgroundColor: 'var(--color-purple)', color: 'white', fontWeight: 'bold', borderRadius: '0.375rem', display: 'flex', alignItems: 'center'}}>
                                    <SparklesIcon style={{width: '1.25rem', height: '1.25rem', marginRight: '0.5rem'}}/> {isAiLoading ? '...' : 'Go'}
                                </button>
                            </div>
                        </div>
                        <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Snippet Title" style={{width: '100%', padding: '0.5rem', backgroundColor: 'var(--color-bg-lighter)', border: '1px solid var(--color-border)', borderRadius: '0.375rem', marginBottom: '1rem', color: 'white', boxSizing: 'border-box'}} />
                        <textarea value={code} onChange={e => setCode(e.target.value)} placeholder="Enter code or generate with AI..." rows="10" style={{width: '100%', padding: '0.5rem', backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '0.375rem', marginBottom: '1rem', fontFamily: 'monospace', color: 'white', boxSizing: 'border-box'}}></textarea>
                        <button onClick={handleAddSnippet} style={{width: '100%', padding: '0.5rem', backgroundColor: 'var(--color-cyan)', color: 'white', fontWeight: 'bold', borderRadius: '0.375rem'}}>Save Snippet</button>
                    </div>
                )}
            </Modal>
            <SnippetViewModal snippet={viewingSnippet} isOpen={!!viewingSnippet} onClose={() => setViewingSnippet(null)} onCopy={(code) => navigator.clipboard.writeText(code)} onUpdate={handleUpdateSnippet} onAiAction={handleAiSnippetAction} isAiLoading={isAiLoading} />
            
            {/* This line renders the new AI Chat Modal */}
            <AiChatModal 
                snippet={aiChatSnippet} 
                isOpen={!!aiChatSnippet} 
                onClose={() => setAiChatSnippet(null)} 
                onSendQuery={handleAiChatQuery} 
                isAiLoading={isAiLoading} 
            />

            <ConfirmModal 
                isOpen={confirmModal.isOpen} 
                onClose={() => setConfirmModal({ isOpen: false, onConfirm: null, message: '' })} 
                onConfirm={confirmModal.onConfirm} 
                message={confirmModal.message} 
            />
        </div>
    );
}


  



