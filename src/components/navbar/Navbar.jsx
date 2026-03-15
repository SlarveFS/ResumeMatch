import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import './Navbar.css';

function Navbar() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          <span className="navbar-logo-icon">◎</span>
          <span>ResumeMatch</span>
        </Link>

        <button
          className={`navbar-hamburger ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span></span><span></span><span></span>
        </button>

        <ul className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <li>
            <Link
              to="/analyze"
              className={`navbar-link ${isActive('/analyze') ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              Analyze
            </Link>
          </li>
          <li>
            <Link
              to="/builder"
              className={`navbar-link ${isActive('/builder') ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              Build Resume
            </Link>
          </li>
          <li>
            <span className="navbar-link disabled">
              Cover Letter <span className="coming-soon-badge">Soon</span>
            </span>
          </li>
          <li>
            <span className="navbar-link disabled">
              Dashboard <span className="coming-soon-badge">Soon</span>
            </span>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
