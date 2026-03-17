// Month/Year picker with optional "Present" checkbox for end dates
// value format: "Jan 2020" | "Present" | ""

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR - 1959 }, (_, i) => CURRENT_YEAR - i);

// Parse "Jan 2020" → { month: 'Jan', year: '2020' }
function parse(value) {
  if (!value || value === 'Present') return { month: '', year: '' };
  const parts = value.trim().split(/\s+/);
  if (parts.length === 2) return { month: parts[0], year: parts[1] };
  if (parts.length === 1 && /^\d{4}$/.test(parts[0])) return { month: '', year: parts[0] };
  return { month: '', year: '' };
}

// Build string from month + year
function build(month, year) {
  if (!month && !year) return '';
  if (month && year) return `${month} ${year}`;
  if (year) return year;
  return '';
}

export default function MonthYearPicker({ value, onChange, allowPresent = false, placeholder = 'Select date' }) {
  const isPresent = value === 'Present';
  const { month, year } = parse(value);

  const handleMonth = (m) => {
    if (isPresent) return;
    onChange(build(m, year));
  };

  const handleYear = (y) => {
    if (isPresent) return;
    onChange(build(month, y));
  };

  const handlePresent = (checked) => {
    onChange(checked ? 'Present' : '');
  };

  return (
    <div className="myp-wrapper">
      <div className={`myp-selects ${isPresent ? 'myp-disabled' : ''}`}>
        <select
          className="myp-select"
          value={month}
          onChange={e => handleMonth(e.target.value)}
          disabled={isPresent}
          aria-label="Month"
        >
          <option value="">Month</option>
          {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <select
          className="myp-select"
          value={year}
          onChange={e => handleYear(e.target.value)}
          disabled={isPresent}
          aria-label="Year"
        >
          <option value="">Year</option>
          {YEARS.map(y => <option key={y} value={String(y)}>{y}</option>)}
        </select>
      </div>
      {allowPresent && (
        <label className="myp-present-label">
          <input
            type="checkbox"
            checked={isPresent}
            onChange={e => handlePresent(e.target.checked)}
          />
          Present
        </label>
      )}
    </div>
  );
}
