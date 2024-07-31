import React from 'react';
import './App.css';
import EstimateForm from './components/EstimateForm';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h2>OneCrew Paving Cost Estimator</h2>
      </header>
      <main>
        <EstimateForm />
      </main>
    </div>
  );
}

export default App;
