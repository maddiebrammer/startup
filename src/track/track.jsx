import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearUser } from '../auth.js';
import './track.css';

export function Track() {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearUser();
    navigate('/');
  };

  const defaultHabits = [
    { id: 1, text: 'Walk the dog', done: false },
    { id: 2, text: 'Eat Breakfast', done: false },
    { id: 3, text: 'Make a Healthy Dinner', done: false },
    { id: 4, text: 'Go to bed at 10', done: false },
    { id: 5, text: 'Wake up at 7', done: false },
    { id: 6, text: 'Make Bed', done: false },
    { id: 7, text: 'Brush teeth', done: false },
  ];

  const [habits, setHabits] = useState(defaultHabits);
  const [newHabitText, setNewHabitText] = useState('');

  // Load habits from server
  useEffect(() => {
    fetch('/api/habits', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        if (data.length) setHabits(data);
      })
      .catch((err) => console.error('Error fetching habits:', err));
  }, []);

  // Save a single habit to server
  const saveHabit = async (habit) => {
    try {
      await fetch('/api/habit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(habit),
      });
    } catch (err) {
      console.error('Error saving habit:', err);
    }
  };

  const toggleHabit = (id) => {
    setHabits((prev) =>
      prev.map((habit) => {
        if (habit.id === id) {
          const updated = { ...habit, done: !habit.done };
          saveHabit(updated);
          return updated;
        }
        return habit;
      })
    );
  };

  // Add new habit
  const addHabit = () => {
    if (!newHabitText.trim()) return;
    const newHabit = {
      id: Date.now(), // simple unique id
      text: newHabitText,
      done: false,
    };
    setHabits((prev) => [...prev, newHabit]);
    saveHabit(newHabit);
    setNewHabitText('');
  };

  // Delete habit
  const deleteHabit = async (id) => {
    setHabits((prev) => prev.filter((habit) => habit.id !== id));
    try {
      await fetch(`/api/habit`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id }),
      });
    } catch (err) {
      console.error('Error deleting habit:', err);
    }
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
        <button onClick={addHabit}>Add</button>
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
            <button className="delete-btn" onClick={() => deleteHabit(habit.id)}>
              ❌
            </button>
          </li>
        ))}
      </ul>

      <div style={{ marginTop: '2rem' }}>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </main>
  );
}
