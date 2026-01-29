'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

type Keyword = {
  keyword: string;
  total: number;
};

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
  const router = useRouter();

  useEffect(() => {
    const id = setInterval(() => router.refresh(), 120000);
    return () => clearInterval(id);
  }, [router]);

  const buildUrl = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams();

    params.set('days', String(updates.days ?? currentDays));
    if (updates.q ?? currentQuery) params.set('q', updates.q ?? currentQuery!);
    if (updates.country ?? currentCountry)
      params.set('country', updates.country ?? currentCountry!);
    if (updates.industry ?? currentIndustry)
      params.set('industry', updates.industry ?? currentIndustry!);
    if (updates.source_type ?? currentSourceType)
      params.set('source_type', updates.source_type ?? currentSourceType!);

    return `/?${params.toString()}`;
  };

  return (
    <>
      {/* Controls */}
      <div style={controls}>
        <div>
          <button
            onClick={() => router.push(buildUrl({ days: '7' }))}
            style={currentDays === 7 ? activeBtn : btn}
          >
            Last 7 days
          </button>

          <button
            onClick={() => router.push(buildUrl({ days: '14' }))}
            style={currentDays === 14 ? activeBtn : btn}
          >
            Last 14 days
          </button>
        </div>

        <form
          onSubmit={e => {
            e.preventDefault();
            const form = e.currentTarget;
            router.push(
              buildUrl({
                q: (form.q as HTMLInputElement).value,
                country: (form.country as HTMLSelectElement).value,
                industry: (form.industry as HTMLSelectElement).value,
                source_type: (form.source_type as HTMLSelectElement).value,
              })
            );
          }}
          style={formRow}
        >
          <input name="q" defaultValue={currentQuery} placeholder="Search…" style={input} />

          <select name="country" defaultValue={currentCountry ?? ''} style={input}>
            <option value="">All countries</option>
            {countries.map(c => (
              <option key={c}>{c}</option>
            ))}
          </select>

          <select name="industry" defaultValue={currentIndustry ?? ''} style={input}>
            <option value="">All industries</option>
            <option>Procurement</option>
            <option>Construction</option>
            <option>IT</option>
            <option>Oil & Gas</option>
            <option>Healthcare</option>
            <option>Staffing</option>
            <option>Events</option>
          </select>

          <select name="source_type" defaultValue={currentSourceType ?? ''} style={input}>
            <option value="">All sources</option>
            <option>Government</option>
            <option>Forum</option>
            <option>Social</option>
            <option>Web</option>
          </select>

          <button type="submit" style={searchBtn}>
            Search
          </button>
        </form>
      </div>

      {/* Popular keywords */}
      {keywords.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <strong>Popular searches:</strong>
          <div style={chipsRow}>
            {keywords.map(k => (
              <button
                key={k.keyword}
                onClick={() => router.push(buildUrl({ q: k.keyword }))}
                style={chip}
              >
                {k.keyword} ({k.total})
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

/* ---------- styles ---------- */

const controls = {
  display: 'flex',
  flexWrap: 'wrap' as const,
  gap: 12,
  justifyContent: 'space-between',
  marginBottom: 24,
};

const formRow = {
  display: 'flex',
  gap: 8,
  flexWrap: 'wrap' as const,
};

const btn = {
  padding: '6px 12px',
  border: '1px solid #ccc',
  borderRadius: 6,
  background: '#fff',
  cursor: 'pointer',
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
};

const searchBtn = {
  padding: '8px 14px',
  borderRadius: 6,
  border: 'none',
  background: '#000',
  color: '#fff',
  cursor: 'pointer',
};

const chipsRow = {
  marginTop: 8,
  display: 'flex',
  gap: 8,
  flexWrap: 'wrap' as const,
};

const chip = {
  padding: '4px 10px',
  borderRadius: 12,
  border: '1px solid #ddd',
  background: '#fafafa',
  cursor: 'pointer',
  fontSize: 13,
};
