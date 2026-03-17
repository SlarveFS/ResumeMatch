import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/navbar/Navbar';
import Landing from './pages/Landing';
import Analyze from './pages/Analyze';
import Builder from './pages/Builder';
import Editor from './pages/Editor';
import WizardBuilder from './pages/WizardBuilder';
import CoverLetter from './pages/CoverLetter';
import Dashboard from './pages/Dashboard';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Navbar />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/analyze" element={<Analyze />} />
          <Route path="/builder" element={<Builder />} />
          <Route path="/builder/wizard" element={<WizardBuilder />} />
          <Route path="/builder/edit" element={<Editor />} />
          <Route path="/cover-letter" element={<CoverLetter />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
        <footer className="footer">
          <p>
            Built by <strong>Slarve Benoit</strong> •{' '}
            <a href="https://github.com/SlarveFS/ResumeMatch" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
          </p>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
