import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './app.css';

import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import { Login } from './login/login';
import { Track } from './track/track';
import { Leaderboard } from './leaderboard/leaderboard';

function NotFound() {
  return (
    <div>
      <h2>404 - Page Not Found</h2>
      <p>Sorry, the page you’re looking for doesn’t exist.</p>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
        <header>
        <h1>NDGE<sup>&reg;</sup></h1>

        <nav>
            <menu>
            <li><NavLink className = "nav-link" to ="/">
                Home
                </NavLink></li>
            <li><NavLink className = "nav-link" to="track">
                Track
                </NavLink></li>
            <li><NavLink className = "nav-link" to="leaderboard">
                Leaderboard
                </NavLink></li>
            </menu>
        </nav>

        <hr />
        </header>
        <Routes>
        <Route path='/' element={<Login />} exact />
        <Route path='/track' element={<Track />} />
        <Route path='/leaderboard' element={<Leaderboard />} />
        <Route path='*' element={<NotFound />} />
        </Routes>
        <footer>
        <hr />
        <span class="text-reset">Maddie Brammer</span>
        <br />
        <a href="https://github.com/maddiebrammer/startup.git">GitHub</a>
        </footer>
    </BrowserRouter>
    )
}