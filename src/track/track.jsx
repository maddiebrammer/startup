import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearUser, getUser } from '../auth.js';
import './track.css';

export function Track() {
  const navigate = useNavigate();
  const userName = getUser();

  const [habits, setHabits] = useState([]);
  const [newHabitText, setNewHabitText] = useState('');

  const handleLogout = () => {
    clearUser();
    navigate('/');
  };

  // Load habits from server on mount
  useEffect(() => {
    fetch('/api/habits', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // send cookies
    })
      .then((res) => res.json())
      .then((data) => setHabits(data))
      .catch(() => setHabits([]));
  }, []);

  // Toggle habit completion
  const toggleHabit = async (id) => {
    const updatedHabits = habits.map((habit) =>
      habit.id === id ? { ...habit, done: !habit.done } : habit
    );
    setHabits(updatedHabits);

    const updatedHabit = updatedHabits.find((h) => h.id === id);

    // Send update to server
    await fetch('/api/habit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(updatedHabit),
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

    await fetch(`/api/habit/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
  };

  return (
    <main>
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
          <li key={habit.id}>
            <label>
              <input
                type="checkbox"
                checked={habit.done}
                onChange={() => toggleHabit(habit.id)}
              />
              {habit.done ? <s>{habit.text}</s> : habit.text}
            </label>
            <button onClick={() => deleteHabit(habit.id)}>Delete</button>
          </li>
        ))}
      </ul>

      <div>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </main>
  );
}
