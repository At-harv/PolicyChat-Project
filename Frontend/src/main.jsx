import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
// Create a root for the React application.
// This is the main entry point where the App component is rendered.
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render the App component inside React.StrictMode for development checks.
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
