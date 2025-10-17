import React from 'react';
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

export function Login() {
  return (
    <main>
      <h1>Welcome to NDGE</h1>
      <img src="/img/NDGE.png" alt="ndge app logo"
       width = {300}/>
      <form method="get" action="track.html">
        <div>
          <span>@</span>
          <input type="text" placeholder="username" />
        </div>
        <div>
          <span>🔒</span>
          <input type="password" placeholder="password" />
        </div>
        <button type="submit">Login</button>
        <button type="submit">Create</button>
      </form>
    </main>

  );
}