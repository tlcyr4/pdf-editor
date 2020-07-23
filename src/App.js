import React from 'react';
import './App.css';
import FileManager from './FileManager';

function App() {
  return (
    <div className="App">
        <SiteNav/>
        <div className="main">
            <header className="pdf-nav">
              <h1 className="page-title">
                PDF One After Another
              </h1>
            </header>
            <FileManager/>
        </div>
    </div>
  );
}

function SiteNav(props) {
  return (
    <nav>
            <div className="nav-section">
              <h2>公公</h2>
            </div>
            <div className="nav-section">
              <h2>PDF</h2>
            </div>
        </nav>
  );
}

export default App;
