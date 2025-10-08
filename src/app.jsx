import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './app.css';

import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import { Login } from './login/login';
import { Track } from './track/track';
import { Leaderboard } from './leaderboard/leaderboard';


export default function App() {
  return (
    <BrowserRouter>
        <header>
        <h1>NDGE<sup>&reg;</sup></h1>

        <nav>
            <menu>
            <li><NavLink className = "navlink active" to ="index">
                Home
                </NavLink></li>
            <li><NavLink className = "navlink active" to="track">
                Track
                </NavLink></li>
            <li><NavLink className = "navlink active" to="leaderboard">
                Leaderboard
                </NavLink></li>
            </menu>
        </nav>

        <hr />
        </header>

        <h1>Welcome to NDGE</h1>
        <img src="./public/img/NDGE.png" alt="ndge app logo">
        <main className = 'container-fluid bg-secondary text-center'>App containers go here</main>
        <footer>
        <hr />
        <span class="text-reset">Maddie Brammer</span>
        <br />
        <a href="https://github.com/maddiebrammer/startup.git">GitHub</a>
        </footer>
    </BrowserRouter>
    )
}