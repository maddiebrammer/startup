import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css'

export const AuthState = {
  Unknown: 'Unknown',
  Authenticated: 'Authenticated',
  Unauthenticated: 'Unauthenticated',
};

function Unauthenticated({ onLogin }) {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    // Mock authentication — later this will call your backend
    if (userName && password) {
      onLogin(userName);
    } else {
      alert('Please enter a username and password');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="login-form">
      <div>
        <span>@</span>
        <input
          type="text"
          placeholder="username"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
        />
      </div>
      <div>
        <span>🔒</span>
        <input
          type="password"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <button type="submit">Login</button>
      <button type="button" onClick={() => alert('Mock: create account flow')}>
        Create
      </button>
    </form>
  );
}

function Authenticated({ userName, onLogout }) {
  return (
    <div className="authenticated">
      <h2>Welcome, {userName}!</h2>
      <button onClick={onLogout}>Logout</button>
    </div>
  );
}

export function Login() {
  const [authState, setAuthState] = useState(AuthState.Unknown);
  const [userName, setUserName] = useState('');
  const navigate = useNavigate(); // 👈 React Router navigation hook

  useEffect(() => {
    // Simulate checking saved session
    const savedUser = localStorage.getItem('ndgeUser');
    if (savedUser) {
      setUserName(savedUser);
      setAuthState(AuthState.Authenticated);
      navigate('/track'); // 👈 automatically go to track if already logged in
    } else {
      setAuthState(AuthState.Unauthenticated);
    }
  }, [navigate]);

  const handleAuthChange = (user, newState) => {
    setUserName(user);
    setAuthState(newState);

    if (newState === AuthState.Authenticated) {
      localStorage.setItem('ndgeUser', user);
      navigate('/track'); // 👈 redirect to track page
    } else {
      localStorage.removeItem('ndgeUser');
    }
  };

  return (
    <main className="container-fluid text-center">
      <h1>Welcome to NDGE</h1>
      <img src="/img/NDGE.png" alt="NDGE app logo" width={300} />

      {authState === AuthState.Authenticated && (
        <Authenticated
          userName={userName}
          onLogout={() => handleAuthChange('', AuthState.Unauthenticated)}
        />
      )}

      {authState === AuthState.Unauthenticated && (
        <Unauthenticated
          onLogin={(user) => handleAuthChange(user, AuthState.Authenticated)}
        />
      )}
    </main>
  );
}