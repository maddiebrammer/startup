import React from 'react';

export function Track() {
  return (
    <main>
      <h1>My Habits</h1>
      <ul>
          <li>
              <label>
                  <input type="checkbox" />
                  Walk the dog
              </label>
          </li>
          <li>
              <label>
                  <input type="checkbox" />
                  Eat Breakfast
              </label>
          </li>
          <li>
              <label>
                  <input type="checkbox" />
                  Make a Healthy Dinner
              </label>
          </li>
          <li>
              <label>
                  <input type="checkbox" />
                  Go to bed at 10
              </label>
          </li>
          <li>
              <label>
                  <input type="checkbox" checked />
                  <s>Wake up at 7</s>
              </label>
          </li>
          <li>
              <label>
                  <input type="checkbox" checked />
                  <s>Make Bed</s>
              </label>
          </li>
          <li>
              <label>
                  <input type="checkbox" checked />
                  <s>Brush teeth</s>
              </label>
          </li>
      </ul>
  </main>
  );
}