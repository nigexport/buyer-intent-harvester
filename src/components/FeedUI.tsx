'use client';

type Keyword = { keyword: string; total: number };

type Props = {
  countries: string[];
  keywords: Keyword[];
  currentDays: number;
  currentPage: number;
  currentQuery?: string;
  currentCountry?: string;
  currentIndustry?: string;
  currentSourceType?: string;
};

export default function FeedUI({
  countries,
  keywords,
  currentDays,
  currentQuery,
  currentCountry,
  currentIndustry,
  currentSourceType,
}: Props) {
  return (
    <div style={{ marginBottom: 24 }}>
      {/* Day Toggle */}
      <div style={{ marginBottom: 12 }}>
        <a href={buildUrl({ days: 7 })} style={currentDays === 7 ? activeBtn : btn}>
          Last 7 days
        </a>
        <a href={buildUrl({ days: 14 })} style={currentDays === 14 ? activeBtn : btn}>
          Last 14 days
        </a>
      </div>

      {/* Filters */}
      <form method="get" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
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

        <select name="industry" defaultValue={currentIndustry || ''} style={input}>
          <option value="">All industries</option>
          <option value="Procurement">Procurement</option>
          <option value="Construction">Construction</option>
          <option value="IT">IT</option>
          <option value="Oil & Gas">Oil & Gas</option>
          <option value="Healthcare">Healthcare</option>
          <option value="Staffing">Staffing</option>
          <option value="Events">Events</option>
        </select>

        <select name="source_type" defaultValue={currentSourceType || ''} style={input}>
          <option value="">All sources</option>
          <option value="Government">Government</option>
          <option value="Forum">Forum</option>
          <option value="Social">Social</option>
          <option value="Web">Web</option>
        </select>

        <input type="hidden" name="days" value={currentDays} />

        <button type="submit" style={searchBtn}>
          Search
        </button>
      </form>

      {/* Popular Keywords */}
      {keywords.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <strong>Popular searches:</strong>
          <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {keywords.map(k => (
              <a
                key={k.keyword}
                href={buildUrl({ q: k.keyword })}
                style={chip}
              >
                {k.keyword} ({k.total})
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- HELPERS ---------------- */

function buildUrl(overrides: Record<string, string | number | undefined>) {
  const params = new URLSearchParams();

  Object.entries(overrides).forEach(([k, v]) => {
    if (v !== undefined && v !== '') params.set(k, String(v));
  });

  return `/?${params.toString()}`;
}

/* ---------------- STYLES ---------------- */

const btn = {
  padding: '6px 12px',
  border: '1px solid #ccc',
  borderRadius: 6,
  textDecoration: 'none',
  color: '#333',
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

const chip = {
  padding: '4px 10px',
  border: '1px solid #ddd',
  borderRadius: 14,
  fontSize: 13,
  textDecoration: 'none',
  color: '#000',
  background: '#fafafa',
};
