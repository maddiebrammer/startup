import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthState, saveUser, getUser, clearUser, getAuthState } from './auth';
import './login.css';

function Unauthenticated({ onLogin }) {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
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
  const navigate = useNavigate();

  // Optional motivational quote placeholder
  const [quote, setQuote] = useState('');

  useEffect(() => {
    setTimeout(() => {
      setQuote('"Success is the sum of small efforts, repeated day in and day out." – Robert Collier');
    }, 1000);
  }, []);

  useEffect(() => {
    const user = getUser();
    if (user) {
      setUserName(user);
      setAuthState(AuthState.Authenticated);
      navigate('/track');
    } else {
      setAuthState(AuthState.Unauthenticated);
    }
  }, [navigate]);

  const handleAuthChange = (user, newState) => {
    setUserName(user);
    setAuthState(newState);

    if (newState === AuthState.Authenticated) {
      saveUser(user);
      navigate('/track');
    } else {
      clearUser();
      navigate('/');
    }
  };

  return (
    <main className="container-fluid text-center">
      <h1>Welcome to NDGE</h1>
      <img src="/img/NDGE.png" alt="NDGE app logo" width={300} />

      {quote && <p className="quote">{quote}</p>}

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
