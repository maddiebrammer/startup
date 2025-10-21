import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './track.css';

export function Track() {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout(); 
    navigate('/'); 
  };
  
    // Initial habits list (can be loaded from server later)
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

  // Load saved habits from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('ndgeHabits');
    if (saved) {
      setHabits(JSON.parse(saved));
    }
  }, []);

  // Save habits whenever they change
  useEffect(() => {
    localStorage.setItem('ndgeHabits', JSON.stringify(habits));
  }, [habits]);

  const toggleHabit = (id) => {
    setHabits((prev) =>
      prev.map((habit) =>
        habit.id === id ? { ...habit, done: !habit.done } : habit
      )
    );
  };

  return (
    <main>
      <h1>My Habits</h1>
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
          </li>
        ))}
      </ul>
      <button onClick={handleLogout}>Logout</button>
    </main>
  );
}
