// ==============================================
// Client-side Store — Simple state management
// ==============================================

// Lightweight reactive store for shared state across components.
// For a larger app, replace with Zustand or Redux Toolkit.

let state = {
  shipments: [],
  vehicles: [],
  warehouses: [],
  notifications: [],
  user: { role: 'admin' },
};

const listeners = new Set();

export function getState() {
  return state;
}

export function setState(updates) {
  state = { ...state, ...updates };
  listeners.forEach((fn) => fn(state));
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export default { getState, setState, subscribe };
