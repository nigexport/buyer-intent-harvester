import { supabase } from '../lib/supabase';
import type { CSSProperties } from 'react';

const PAGE_SIZE = 15;

export default async function Home({
  searchParams,
}: {
  searchParams: { days?: string; page?: string; q?: string };
}) {
  /* -----------------------
     Days toggle
  ------------------------ */
  const days = searchParams.days === '14' ? 14 : 7;
  const fromDate = new Date(
    Date.now() - days * 24 * 60 * 60 * 1000
  ).toISOString();

  /* -----------------------
     Pagination
  ------------------------ */
  const page = Number(searchParams.page || '1');
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const searchQuery = searchParams.q?.trim();

  let query = supabase
    .from('buyer_intents')
    .select(
      `
      id,
      source_url,
      clean_text,
      request_category,
      country,
      created_at
    `,
      { count: 'exact' }
    )
    .gte('created_at', fromDate)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (searchQuery) {
    query = query.or(
      `clean_text.ilike.%${searchQuery}%,request_category.ilike.%${searchQuery}%`
    );
  }

  const { data, error } = await query;

  if (error) {
    return (
      <main style={styles.container}>
        <h2>Error loading feed</h2>
        <pre>{JSON.stringify(error, null, 2)}</pre>
      </main>
    );
  }

  return (
    <main style={styles.container}>
      <h1 style={styles.title}>Buyer Intent Feed</h1>

      {/* Controls */}
      <div style={styles.controls}>
        <div>
          <a href="/?days=7" style={days === 7 ? styles.activeBtn : styles.btn}>
            Last 7 days
          </a>
          <a href="/?days=14" style={days === 14 ? styles.activeBtn : styles.btn}>
            Last 14 days
          </a>
        </div>

        <form method="get" style={styles.searchForm}>
          <input
            name="q"
            defaultValue={searchQuery}
            placeholder="Search buyer requests…"
            style={styles.searchInput}
          />
          <input type="hidden" name="days" value={days} />
          <button type="submit" style={styles.searchBtn}>
            Search
          </button>
        </form>
      </div>

      {/* Feed */}
      {data?.length === 0 && (
        <p style={styles.empty}>No buyer requests found.</p>
      )}

      {data?.map(item => {
        const title =
          item.request_category?.replace(/^=+/, '') || 'Buyer Request';

        const text =
          item.clean_text
            ?.replace(/^=+/, '')
            ?.replace(/^\{.*"source_url".*\}$/, '') || '';

        return (
          <div key={item.id} style={styles.card}>
            {item.source_url ? (
              <a
                href={item.source_url}
                target="_blank"
                rel="noopener noreferrer"
                style={styles.cardTitle}
              >
                {title}
              </a>
            ) : (
              <div style={styles.cardTitle}>{title}</div>
            )}

            {text && <p style={styles.text}>{text}</p>}

            <div style={styles.meta}>
              {item.country || 'Unknown country'} ·{' '}
              {new Date(item.created_at).toLocaleDateString()}
            </div>

            <div style={styles.locked}>
              🔒 Contact details available for paid users
            </div>
          </div>
        );
      })}

      {/* Pagination */}
      <div style={styles.pagination}>
        {page > 1 && (
          <a href={`/?days=${days}&page=${page - 1}`} style={styles.btn}>
            ← Previous
          </a>
        )}
        {data && data.length === PAGE_SIZE && (
          <a href={`/?days=${days}&page=${page + 1}`} style={styles.btn}>
            Next →
          </a>
        )}
      </div>
    </main>
  );
}

/* =====================
   CLEAN UI STYLES
===================== */

const styles: Record<string, CSSProperties> = {
  container: {
    maxWidth: 900,
    margin: '0 auto',
    padding: 32,
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
    background: '#fafafa',
    minHeight: '100vh',
  },
  title: {
    marginBottom: 24,
    fontSize: 28,
    fontWeight: 700,
  },
  controls: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    flexWrap: 'wrap',
    gap: 12,
  },
  btn: {
    marginRight: 8,
    padding: '8px 14px',
    border: '1px solid #ccc',
    borderRadius: 8,
    textDecoration: 'none',
    color: '#333',
    fontSize: 14,
    background: '#fff',
  },
  activeBtn: {
    marginRight: 8,
    padding: '8px 14px',
    borderRadius: 8,
    background: '#111',
    color: '#fff',
    textDecoration: 'none',
    fontSize: 14,
  },
  searchForm: {
    display: 'flex',
    gap: 8,
  },
  searchInput: {
    padding: '8px 10px',
    borderRadius: 8,
    border: '1px solid #ccc',
    width: 240,
  },
  searchBtn: {
    padding: '8px 16px',
    borderRadius: 8,
    border: 'none',
    background: '#111',
    color: '#fff',
    cursor: 'pointer',
  },
  card: {
    background: '#fff',
    padding: 16,
    borderRadius: 10,
    marginBottom: 14,
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  cardTitle: {
    fontWeight: 600,
    fontSize: 16,
    textDecoration: 'none',
    color: '#111',
    display: 'block',
    marginBottom: 6,
  },
  text: {
    margin: '6px 0 10px',
    color: '#333',
    lineHeight: 1.5,
  },
  meta: {
    fontSize: 12,
    color: '#666',
  },
  locked: {
    marginTop: 8,
    fontSize: 12,
    color: '#999',
  },
  pagination: {
    marginTop: 32,
    display: 'flex',
    gap: 12,
  },
  empty: {
    color: '#666',
    fontStyle: 'italic',
  },
};
