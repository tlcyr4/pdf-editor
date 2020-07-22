import React from 'react';
import './App.css';

import FileManager from './FileManager';

function App() {
  return (
    <div className="App">
      <nav>
            <div className="nav-section">
              <h2>公公</h2>
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
