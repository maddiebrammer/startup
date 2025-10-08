import React from 'react';

export function Leaderboard() {
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
            <tr>
              <td><div class="row-card">James</div></td>
              <td><div class="row-card">10</div></td>
            </tr>
            <tr>
              <td><div class="row-card">Milly</div></td>
              <td><div class="row-card">7</div></td>
            </tr>
            <tr>
              <td><div class="row-card">You</div></td>
              <td><div class="row-card">3</div></td>
            </tr>
            <tr>
              <td><div class="row-card">Brian</div></td>
              <td><div class="row-card">2</div></td>
            </tr>
            </tbody>
        </table>
    </main>
  );
}