'use client';

type Props = {
  countries: string[];
  currentDays: number;
  currentPage: number;
  currentQuery?: string;
  currentCountry?: string;
};

export default function FeedUI({
  countries,
  currentDays,
  currentQuery,
  currentCountry,
}: Props) {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 12,
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
      }}
    >
      {/* Day Toggle */}
      <div>
        <a
          href={`/?days=7${
            currentQuery ? `&q=${encodeURIComponent(currentQuery)}` : ''
          }${currentCountry ? `&country=${currentCountry}` : ''}`}
          style={currentDays === 7 ? activeBtn : btn}
        >
          Last 7 days
        </a>

        <a
          href={`/?days=14${
            currentQuery ? `&q=${encodeURIComponent(currentQuery)}` : ''
          }${currentCountry ? `&country=${currentCountry}` : ''}`}
          style={currentDays === 14 ? activeBtn : btn}
        >
          Last 14 days
        </a>
      </div>

      {/* Search + Country */}
      <form method="get" style={{ display: 'flex', gap: 8 }}>
        <input
          name="q"
          defaultValue={currentQuery || ''}
          placeholder="Search buyer requests…"
          style={input}
        />

        <select name="country" defaultValue={currentCountry || ''} style={input}>
          <option value="">All countries</option>
          {countries.map(c => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <input type="hidden" name="days" value={currentDays} />

        <button type="submit" style={searchBtn}>
          Search
        </button>
      </form>
    </div>
  );
}

const btn = {
  padding: '6px 12px',
  border: '1px solid #ccc',
  borderRadius: 6,
  textDecoration: 'none',
  color: '#333',
  fontSize: 14,
  marginRight: 8,
};

const activeBtn = {
  ...btn,
  background: '#000',
  color: '#fff',
};

const input = {
  padding: 8,
  borderRadius: 6,
  border: '1px solid #ccc',
  fontSize: 14,
};

const searchBtn = {
  padding: '8px 14px',
  borderRadius: 6,
  border: 'none',
  background: '#000',
  color: '#fff',
  cursor: 'pointer',
};

