import React, { useState, useEffect } from 'react';
import './leaderboard.css';

export function Leaderboard() {
  const [players, setPlayers] = useState([]);
  const [currentUser, setCurrentUser] = useState('');

  // Load username from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('ndgeUser');
    if (savedUser) {
      setCurrentUser(savedUser);
    }
  }, []);

  useEffect(() => {
    fetch('/api/scores')
      .then(res => res.json())
      .then(data => setPlayers(data));
  }, []);


  // Fetch leaderboard scores from backend
  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('/api/scores', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // send cookies for auth
      });

      if (response.ok) {
        const scores = await response.json();
        setPlayers(scores);
      } else {
        console.error('Failed to load leaderboard:', response.status);
      }
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
    }
  };

  // Fetch leaderboard on mount and periodically
  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 5000); // refresh every 5s
    return () => clearInterval(interval);
  }, []);

  // Sort players dynamically by points (highest first)
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

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
              className={player.name === currentUser ? 'highlight-row' : ''}
            >
              <td>
                <div className="row-card">{player.name}</div>
              </td>
              <td>
                <div className="row-card">{player.score}</div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
