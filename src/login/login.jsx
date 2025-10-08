import React from 'react';

export function Login() {
  return (
    <main>
      <h1>Welcome to NDGE</h1>
      <img src="./public/img/NDGE.png" alt="ndge app logo"
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