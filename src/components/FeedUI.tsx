'use client';

import { useEffect, useState } from 'react';

type Props = {
  countries: string[];
  currentDays: number;
  currentCountry?: string;
  currentQuery?: string;
};

export default function FeedUI({
  countries,
  currentDays,
  currentCountry,
  currentQuery,
}: Props) {
  const [saved, setSaved] = useState<any[]>([]);

  /* -----------------------
     Load saved searches
  ------------------------ */
  useEffect(() => {
    const s = localStorage.getItem('saved-searches');
    if (s) setSaved(JSON.parse(s));
  }, []);

  function saveSearch() {
    const entry = {
      q: currentQuery || '',
      country: currentCountry || '',
      days: currentDays,
    };

    const next = [entry, ...saved].slice(0, 5);
    setSaved(next);
    localStorage.setItem('saved-searches', JSON.stringify(next));
  }

  return (
    <>
      {/* Controls */}
      <div className="controls">
        <div className="toggles">
          <a href="/?days=7">Last 7 days</a>
          <a href="/?days=14">Last 14 days</a>
        </div>

        <form method="get" className="search">
          <input name="q" placeholder="Search…" defaultValue={currentQuery} />
          <select name="country" defaultValue={currentCountry || ''}>
            <option value="">All countries</option>
            {countries.map(c => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <input type="hidden" name="days" value={currentDays} />
          <button type="submit">Search</button>
        </form>

        <button onClick={saveSearch} className="save">
          ⭐ Save search
        </button>
      </div>

      {/* Saved searches */}
      {saved.length > 0 && (
        <div className="saved">
          <strong>Saved searches</strong>
          {saved.map((s, i) => (
            <a
              key={i}
              href={`/?days=${s.days}&q=${encodeURIComponent(
                s.q
              )}&country=${encodeURIComponent(s.country)}`}
            >
              {s.q || 'Any'} · {s.country || 'All'} · {s.days}d
            </a>
          ))}
        </div>
      )}

      {/* Mobile tweaks */}
      <style jsx>{`
        .controls {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 16px;
        }
        .search {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        input,
        select,
        button {
          padding: 8px;
          border-radius: 6px;
          border: 1px solid #ccc;
        }
        button {
          background: #111;
          color: #fff;
        }
        .save {
          background: #fff;
          color: #111;
          border: 1px dashed #ccc;
        }
        .saved {
          margin-bottom: 20px;
          font-size: 13px;
        }
        .saved a {
          display: block;
          margin-top: 4px;
        }

        @media (max-width: 640px) {
          .controls {
            flex-direction: column;
            align-items: stretch;
          }
          .search {
            flex-direction: column;
          }
        }
      `}</style>
    </>
  );
}
