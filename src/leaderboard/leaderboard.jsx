import React, { useState, useEffect } from 'react';
import './leaderboard.css';

export function Leaderboard() {
  const [players, setPlayers] = useState([
    { name: 'James', points: 10 },
    { name: 'Milly', points: 7 },
    { name: 'You', points: 3 },
    { name: 'Brian', points: 2 },
  ]);

  const [currentUser, setCurrentUser] = useState('');

  // Load username from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('ndgeUser');
    if (savedUser) {
      setCurrentUser(savedUser);
      // Replace "You" with their actual name
      setPlayers((prev) =>
        prev.map((p) =>
          p.name === 'You' ? { ...p, name: savedUser } : p
        )
      );
    }
  }, []);

  // Simulate leaderboard updates (mock WebSocket)
  useEffect(() => {
    const interval = setInterval(() => {
      setPlayers((prev) =>
        prev.map((player) => ({
          ...player,
          // random small change for demonstration
          points: player.points + Math.floor(Math.random() * 3) - 1,
        }))
      );
    }, 5000); // update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Sort players dynamically by points (highest first)
  const sortedPlayers = [...players].sort((a, b) => b.points - a.points);

  return (
    <main>
      <h1>Leaderboard</h1>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Points</th>
          </tr>
        </thead>
        <tbody>
          {sortedPlayers.map((player, index) => (
            <tr
              key={index}
              className={
                player.name === currentUser ? 'highlight-row' : ''
              }
            >
              <td>
                <div className="row-card">{player.name}</div>
              </td>
              <td>
                <div className="row-card">{player.points}</div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
