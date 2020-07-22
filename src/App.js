import React from 'react';
import './App.css';
import seal from './chinese_seal.png';

import FileManager from './FileManager';

function App() {
  return (
    <div className="App">
      <nav>
            <div className="nav-section">
              <img src={seal} alt="王熠炽"/>
            </div>
            <div className="nav-section">
                <h2>PDF</h2>
            </div>
        </nav>
        <div className="main">
            <h1 className="page-title">PDF One After Another</h1>
        <FileManager/>

        </div>
    </div>
  );
}

export default App;
