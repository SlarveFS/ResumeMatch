import { useState, useRef, useEffect, useCallback } from 'react';
import './LocationAutocomplete.css';

// Major US cities — "City, ST" format
const US_CITIES = [
  'New York, NY','Los Angeles, CA','Chicago, IL','Houston, TX','Phoenix, AZ',
  'Philadelphia, PA','San Antonio, TX','San Diego, CA','Dallas, TX','San Jose, CA',
  'Austin, TX','Jacksonville, FL','Fort Worth, TX','Columbus, OH','San Francisco, CA',
  'Charlotte, NC','Indianapolis, IN','Seattle, WA','Denver, CO','Nashville, TN',
  'Oklahoma City, OK','El Paso, TX','Washington, DC','Las Vegas, NV','Louisville, KY',
  'Memphis, TN','Portland, OR','Baltimore, MD','Milwaukee, WI','Albuquerque, NM',
  'Tucson, AZ','Fresno, CA','Sacramento, CA','Mesa, AZ','Kansas City, MO',
  'Atlanta, GA','Omaha, NE','Colorado Springs, CO','Raleigh, NC','Long Beach, CA',
  'Virginia Beach, VA','Minneapolis, MN','Tampa, FL','New Orleans, LA','Arlington, TX',
  'Bakersfield, CA','Honolulu, HI','Anaheim, CA','Aurora, CO','Santa Ana, CA',
  'Corpus Christi, TX','Riverside, CA','St. Louis, MO','Lexington, KY','Pittsburgh, PA',
  'Stockton, CA','Cincinnati, OH','St. Paul, MN','Toledo, OH','Greensboro, NC',
  'Newark, NJ','Plano, TX','Henderson, NV','Lincoln, NE','Buffalo, NY',
  'Fort Wayne, IN','Jersey City, NJ','Chula Vista, CA','Orlando, FL','St. Petersburg, FL',
  'Norfolk, VA','Chandler, AZ','Laredo, TX','Madison, WI','Durham, NC',
  'Lubbock, TX','Winston-Salem, NC','Garland, TX','Glendale, AZ','Hialeah, FL',
  'Reno, NV','Baton Rouge, LA','Irvine, CA','Chesapeake, VA','Irving, TX',
  'Scottsdale, AZ','North Las Vegas, NV','Fremont, CA','Gilbert, AZ','San Bernardino, CA',
  'Boise, ID','Birmingham, AL','Rochester, NY','Richmond, VA','Spokane, WA',
  'Des Moines, IA','Montgomery, AL','Modesto, CA','Fayetteville, NC','Tacoma, WA',
  'Shreveport, LA','Fontana, CA','Moreno Valley, CA','Glendale, CA','Akron, OH',
  'Huntington Beach, CA','Little Rock, AR','Columbus, GA','Augusta, GA','Grand Rapids, MI',
  'Oxnard, CA','Tallahassee, FL','Huntsville, AL','Worcester, MA','Knoxville, TN',
  'Providence, RI','Brownsville, TX','Santa Clarita, CA','Garden Grove, CA','Oceanside, CA',
  'Chattanooga, TN','Fort Lauderdale, FL','Rancho Cucamonga, CA','Santa Rosa, CA','Port Arthur, TX',
  'Tempe, AZ','Cape Coral, FL','Sioux Falls, SD','Eugene, OR','Peoria, IL',
  'Springfield, MO','Jackson, MS','Lansing, MI','Columbia, SC','Hayward, CA',
  'Palmdale, CA','Salinas, CA','Sunnyvale, CA','Pomona, CA','Escondido, CA',
  'Surprise, AZ','Pasadena, TX','Rockford, IL','Torrance, CA','Orange, CA',
  'Savannah, GA','Paterson, NJ','Bridgeport, CT','Hartford, CT','McKinney, TX',
  'Frisco, TX','Killeen, TX','Mesquite, TX','McAllen, TX','Pasadena, CA',
  'Bellevue, WA','Syracuse, NY','Alexandria, VA','Kansas City, KS','Macon, GA',
  'Cary, NC','Wichita, KS','Hampton, VA','Clarksville, TN','Warren, MI',
  'West Valley City, UT','Columbia, MO','Sterling Heights, MI','Roseville, CA','Miami, FL',
  'Ann Arbor, MI','Concord, CA','Cedar Rapids, IA','New Haven, CT','Stamford, CT',
  'Fargo, ND','Elgin, IL','Berkeley, CA','Peoria, AZ','Provo, UT',
  'El Monte, CA','Westminster, CO','Costa Mesa, CA','Inglewood, CA','Manchester, NH',
];

function matchCities(query) {
  if (!query || query.length < 2) return [];
  const lower = query.toLowerCase();
  return US_CITIES
    .filter(c => c.toLowerCase().startsWith(lower) || c.toLowerCase().includes(`, ${lower}`))
    .slice(0, 6);
}

export default function LocationAutocomplete({ value, onChange, placeholder = 'City, State', className = '' }) {
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const wrapperRef = useRef(null);

  const handleInput = (e) => {
    const v = e.target.value;
    onChange(v);
    const matches = matchCities(v);
    setSuggestions(matches);
    setOpen(matches.length > 0);
    setActiveIdx(-1);
  };

  const pick = useCallback((city) => {
    onChange(city);
    setSuggestions([]);
    setOpen(false);
  }, [onChange]);

  const handleKeyDown = (e) => {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx(i => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && activeIdx >= 0) {
      e.preventDefault();
      pick(suggestions[activeIdx]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="loc-wrapper" ref={wrapperRef}>
      <input
        type="text"
        className={`wizard-input ${className}`}
        placeholder={placeholder}
        value={value || ''}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        onFocus={() => { if (suggestions.length > 0) setOpen(true); }}
        autoComplete="off"
      />
      {open && suggestions.length > 0 && (
        <ul className="loc-dropdown" role="listbox">
          {suggestions.map((city, i) => (
            <li
              key={city}
              className={`loc-option ${i === activeIdx ? 'active' : ''}`}
              role="option"
              aria-selected={i === activeIdx}
              onMouseDown={() => pick(city)}
            >
              <span className="loc-icon">📍</span>
              {city}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
