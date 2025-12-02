import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearUser, getUser } from '../auth.js';
import './track.css';
import { scoreNotifier } from './scoreNotifier.js';


export function Track() {
  const navigate = useNavigate();
  const userName = getUser();

  const [habits, setHabits] = useState([]);
  const [newHabitText, setNewHabitText] = useState('');
  const [events, setEvents] = useState([]);


  // Logout function
  const handleLogout = () => {
    clearUser();
    navigate('/');
  };

  useEffect(() => {
  function handleEvent(event) {
    if (event.type === "scoreUpdate") {
      setEvents(prev => [...prev, `${event.user} increased their score to ${event.score}`]);
    }
  }

  scoreNotifier.addHandler(handleEvent);
  return () => scoreNotifier.removeHandler(handleEvent);
}, []);


  // Verify auth and load habits
  useEffect(() => {
    const verifyAndLoad = async () => {
      try {
        const verifyRes = await fetch('/api/auth/verify', {
          method: 'GET',
          credentials: 'include',
        });

        if (!verifyRes.ok) {
          navigate('/');
          return;
        }

        const habitsRes = await fetch('/api/habits', {
          method: 'GET',
          credentials: 'include',
        });

        if (habitsRes.ok) {
          const data = await habitsRes.json();
          setHabits(data);
        } else {
          setHabits([]);
        }
      } catch (err) {
        console.warn('Error loading habits', err);
        navigate('/');
      }
    };

    verifyAndLoad();
  }, [navigate]);

 // Toggle habit completion
const toggleHabit = async (id) => {
  const updatedHabits = habits.map((habit) =>
    habit.id === id ? { ...habit, done: !habit.done } : habit
  );
  setHabits(updatedHabits);

  const updatedHabit = updatedHabits.find((h) => h.id === id);

  // Update habit state on backend
  await fetch('/api/habit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(updatedHabit),
  });

  // Tell backend to recalculate user's score
  await fetch('/api/score', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
};


  // Add a new habit
  const addHabit = async () => {
    if (!newHabitText.trim()) return;

    const newHabit = {
      id: Date.now(),
      text: newHabitText.trim(),
      done: false,
    };

    setHabits((prev) => [...prev, newHabit]);
    setNewHabitText('');

    await fetch('/api/habit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(newHabit),
    });
  };

  // Delete a habit
  const deleteHabit = async (id) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));

    await fetch('/api/habit', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ id }),
    });

    // Recalculate user's score
    const res = await fetch('/api/score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (res.ok) {
      const updatedScores = await res.json();
      setScores(updatedScores); // <-- this updates the leaderboard
    }
  };

  return (
    <main>
      <div className="score-events">
        {events.map((msg, i) => (
          <div key={i} className="event-msg">{msg}</div>
        ))}
      </div>
      <h1>My Habits</h1>

      <div className="add-habit">
        <input
          type="text"
          placeholder="New habit"
          value={newHabitText}
          onChange={(e) => setNewHabitText(e.target.value)}
        />
        <button onClick={addHabit}>Add Habit</button>
      </div>

      <ul>
        {habits.map((habit) => (
          <li key={habit.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ flexGrow: 1 }}>
              <input
                type="checkbox"
                checked={habit.done}
                onChange={() => toggleHabit(habit.id)}
              />
              {habit.done ? <s>{habit.text}</s> : habit.text}
            </label>
            <button
              onClick={() => deleteHabit(habit.id)}
              style={{
                fontSize: '0.8rem',
                padding: '2px 6px',
                backgroundColor: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              X
            </button>
          </li>
        ))}
      </ul>

      <div>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </main>
  );
}
