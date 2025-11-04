import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthState, saveUser, getUser, clearUser } from '../auth.js';
import './login.css';

function Unauthenticated({ onLogin }) {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Handles login or registration by calling backend
  const loginOrCreate = async (endpoint) => {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify({ email: userName, password }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        saveUser(userName); // store locally
        onLogin(userName);
      } else {
        const body = await response.json();
        setError(`⚠ Error: ${body.msg}`);
      }
    } catch (err) {
      setError(`⚠ Error: ${err.message}`);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (userName && password) {
      loginOrCreate('/api/auth/login');
    } else {
      setError('Please enter username and password');
    }
  };

  const handleCreate = () => {
    if (userName && password) {
      loginOrCreate('/api/auth/create');
    } else {
      setError('Please enter username and password');
    }
  };

  return (
    <form onSubmit={handleLogin} className="login-form">
      {error && <p className="error">{error}</p>}
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
      <button type="button" onClick={handleCreate}>
        Create Account
      </button>
    </form>
  );
}

function Authenticated({ userName, onLogout }) {
  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'DELETE' });
    } catch (err) {
      console.warn('Logout failed', err);
    } finally {
      clearUser();
      onLogout();
    }
  };

  return (
    <div className="authenticated">
      <h2>Welcome, {userName}!</h2>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

export function Login() {
  const [authState, setAuthState] = useState(AuthState.Unknown);
  const [userName, setUserName] = useState('');
  const [quote, setQuote] = useState('');
  const [quoteAuthor, setQuoteAuthor] = useState('');
  const navigate = useNavigate();

  // Fetch a new motivational quote
  const fetchQuote = async () => {
    try {
      const response = await fetch('https://quote.cs260.click');
      if (!response.ok) throw new Error('Failed to fetch quote');
      const data = await response.json();
      setQuote(data.quote);
      setQuoteAuthor(data.author);
    } catch (err) {
      console.warn('Quote fetch failed', err);
      setQuote('"Stay positive and keep moving forward."');
      setQuoteAuthor('NDGE');
    }
  };

  // Fetch a quote on mount, then every hour
  useEffect(() => {
    fetchQuote(); // initial fetch

    const interval = setInterval(fetchQuote, 1000 * 60 * 60); // every hour
    return () => clearInterval(interval); // cleanup
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
      navigate('/track');
    } else {
      navigate('/');
    }
  };

  return (
    <main className="container-fluid text-center">
      <h1>Welcome to NDGE</h1>
      <img src="/img/NDGE.png" alt="NDGE app logo" width={300} />

      {quote && (
        <p className="quote">
          {quote} {quoteAuthor && `– ${quoteAuthor}`}
        </p>
      )}

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

