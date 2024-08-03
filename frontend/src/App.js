import React from 'react';
import './App.css';
import EstimateForm from './components/EstimateForm';
import CustomerManagement from './components/CustomerManagement';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>OneCrew Paving Cost Estimator</h1>
      </header>
      <main>
        <CustomerManagement />
        <EstimateForm />
      </main>
    </div>
  );
}

export default App;

