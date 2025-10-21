export const AuthState = {
  Unknown: 'Unknown',
  Authenticated: 'Authenticated',
  Unauthenticated: 'Unauthenticated',
};

// Save a logged-in user
export function saveUser(userName) {
  localStorage.setItem('ndgeUser', userName);
}

// Get the saved user (if any)
export function getUser() {
  return localStorage.getItem('ndgeUser');
}

// Clear user when logging out
export function clearUser() {
  localStorage.removeItem('ndgeUser');
}

// Check if the user is authenticated
export function getAuthState() {
  return getUser() ? AuthState.Authenticated : AuthState.Unauthenticated;
}
