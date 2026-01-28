'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

type Props = {
  countries: string[];
  keywords: { keyword: string; total: number }[];
  currentDays: number;
  currentQuery?: string;
  currentCountry?: string;
  currentIndustry?: string;
  currentSourceType?: string;
  page: number;
  pageSize: number;
  hasNext: boolean;
};

export default function FeedUI({
  countries,
  keywords,
  currentDays,
  currentQuery,
  currentCountry,
  currentIndustry,
  currentSourceType,
  page,
  hasNext,
}: Props) {
  const params = useSearchParams();

  const buildUrl = (overrides: Record<string, string | number | undefined>) => {
    const p = new URLSearchParams(params.toString());
    Object.entries(overrides).forEach(([k, v]) => {
      if (v === undefined || v === '') p.delete(k);
      else p.set(k, String(v));
    });
    return `/?${p.toString()}`;
  };

  /* Realtime refresh */
  useEffect(() => {
    const id = setInterval(() => window.location.reload(), 120000);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      {/* Controls */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
        <div>
          <a href={buildUrl({ days: 7, page: 1 })} style={currentDays === 7 ? activeBtn : btn}>
            Last 7 days
          </a>
          <a href={buildUrl({ days: 14, page: 1 })} style={currentDays === 14 ? activeBtn : btn}>
            Last 14 days
          </a>
        </div>

        <form method="get" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input name="q" defaultValue={currentQuery || ''} placeholder="Search…" style={input} />

          <select name="country" defaultValue={currentCountry || ''} style={input}>
            <option value="">All countries</option>
            {countries.map(c => (
              <option key={c} value={c}>{c}</option>
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
          <button type="submit" style={searchBtn}>Search</button>
        </form>
      </div>

      {/* Popular searches */}
      {keywords.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <strong>Popular searches:</strong>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
            {keywords.map(k => (
              <a
                key={k.keyword}
                href={buildUrl({ q: k.keyword, page: 1 })}
                style={keywordBtn}
              >
                {k.keyword} ({k.total})
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Pagination */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        {page > 1 && (
          <a href={buildUrl({ page: page - 1 })} style={btn}>← Previous</a>
        )}
        {hasNext && (
          <a href={buildUrl({ page: page + 1 })} style={btn}>Next →</a>
        )}
      </div>
    </>
  );
}

/* Styles */
const btn = {
  padding: '6px 12px',
  border: '1px solid #ccc',
  borderRadius: 6,
  textDecoration: 'none',
  color: '#333',
};

const activeBtn = { ...btn, background: '#000', color: '#fff' };

const input = {
  padding: 8,
  borderRadius: 6,
  border: '1px solid #ccc',
};

const searchBtn = {
  padding: '8px 14px',
  borderRadius: 6,
  border: 'none',
  background: '#000',
  color: '#fff',
};

const keywordBtn = {
  padding: '4px 10px',
  borderRadius: 12,
  border: '1px solid #ddd',
  textDecoration: 'none',
  fontSize: 13,
  background: '#fafafa',
};
