import React from 'react';
import { SparklesIcon } from './Icons';

export const Navbar = ({ onLogout, setPage, page }) => {
    return (
        <nav className="navbar animate-fade-in-down">
            <div className="navbar-left">
                <div className="navbar-brand">
                    <SparklesIcon style={{ width: '2rem', height: '2rem', color: 'var(--color-cyan)' }} />
                    <span>sonicxcode</span>
                </div>
            </div>
            
            <div className="navbar-links">
                <button onClick={() => setPage('home')} className={page === 'home' ? 'active' : ''}>Home</button>
                <button onClick={() => setPage('projects')} className={page === 'projects' ? 'active' : ''}>Projects</button>
                <button onClick={() => setPage('snippets')} className={page === 'snippets' ? 'active' : ''}>Snippets</button>
            </div>

            <div className="navbar-right">
                <button onClick={onLogout} className="navbar-logout">Logout</button>
            </div>
        </nav>
    );
};
