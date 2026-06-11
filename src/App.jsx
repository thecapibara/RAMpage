import React from 'react';
import Dashboard from './components/Dashboard';
import MinionWindow from './components/MinionWindow';

export default function App() {
  const isMinionWindow = new URLSearchParams(window.location.search).get('minion') === 'true';
  
  if (isMinionWindow) {
    return <MinionWindow />;
  }
  
  return <Dashboard />;
}
