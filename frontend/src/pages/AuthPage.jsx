import React, { useState, useEffect } from 'react';
import { SparklesIcon, GoogleIcon, EmailIcon, LockIcon } from '../components/Icons';
import { GoogleLogin } from '@react-oauth/google';

export default function AuthPage({ onLogin, onSignup, onGoogleLogin, email, password, setEmail, setPassword }) {
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    // On component mount, check for saved email in localStorage
    useEffect(() => {
        const savedEmail = localStorage.getItem('rememberedEmail');
        if (savedEmail) {
            setEmail(savedEmail);
            setRememberMe(true);
        }
    }, [setEmail]);

    const handleLoginSubmit = (e) => {
        e.preventDefault();
        if (rememberMe) {
            localStorage.setItem('rememberedEmail', email);
        } else {
            localStorage.removeItem('rememberedEmail');
        }
        onLogin(e);
    };
    
    const handleSignupSubmit = (e) => {
        e.preventDefault();
        localStorage.removeItem('rememberedEmail'); // Clear saved email on signup
        onSignup(e);
    };

    return (
        <div className="auth-page-container">
            <div className="auth-page">
                <div className="auth-header">
                    <h1>
                        <SparklesIcon style={{ width: '2.25rem', height: '2.25rem' }}/>
                        sonicxcode
                    </h1>
                </div>
                <p>{isLogin ? 'Log in to access your snippets' : 'Create an account to start your journey'}</p>
                <form onSubmit={isLogin ? handleLoginSubmit : handleSignupSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <div className="input-with-icon">
                            <EmailIcon />
                            <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="example@gmail.com" required />
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <div className="input-with-icon password-group">
                            <LockIcon />
                            <input 
                                type={showPassword ? "text" : "password"} 
                                id="password" 
                                value={password} 
                                onChange={e => setPassword(e.target.value)} 
                                placeholder="Password"
                                required 
                            />

                        </div>
                    </div>

                    {isLogin && (
                        <div className="form-check">
                            <input 
                                type="checkbox" 
                                id="rememberMe" 
                                checked={rememberMe} 
                                onChange={(e) => setRememberMe(e.target.checked)} 
                            />
                            <label htmlFor="rememberMe">Remember me</label>
                        </div>
                    )}
                    
                    <button type="submit" className="submit-btn">{isLogin ? 'Log In' : 'Sign Up'}</button>
                </form>

                <div className="social-login-divider">
                    <span>Or</span>
                </div>

                 <div className="social-login-buttons">
                    {/* <button type="button" onClick={() => <GoogleLogin/> }>
                        <GoogleIcon /> 
                    </button> */}
                    <GoogleLogin
                        onSuccess={onGoogleLogin}
                        onError={() => {
                            alert('Login Failed. Please try again.');
                        }}
                        
                    />
                </div>

                <div className="auth-switcher">
                    <p>
                        {isLogin ? "Don't have an account?" : "Already have an account?"}
                        <button type="button" onClick={() => setIsLogin(!isLogin)}>
                            {isLogin ? 'Sign Up' : 'Log In'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};
