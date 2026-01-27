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

  const styles: Record<string, CSSProperties> = {
    controls: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 24,
      flexWrap: 'wrap',
      gap: 12,
    },
    // other styles...
  };

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

  /* -----------------------
     FIXED SEARCH
  ------------------------ */
  if (searchQuery) {
    query = query.or(
      `clean_text.ilike.%${searchQuery}%,request_category.ilike.%${searchQuery}%`
    );
  }

  const { data, error } = await query;

  if (error) {
    return (
      <main style={{ padding: 24 }}>
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
      {data?.length === 0 && <p>No results found.</p>}

      {data?.map(item => {
        const title =
          item.request_category?.replace(/^=+/, '') || 'Buyer Request';

        const text =
          item.clean_text
            ?.replace(/^=+/, '')
            ?.replace(/^\{.*"source_url".*\}$/, '') || '';

        return (
          <div key={item.id} style={styles.card}>
            <a
              href={item.source_url}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.cardTitle}
            >
              {title}
            </a>

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
   SIMPLE STYLES
===================== */

const styles = {
  container: {
    maxWidth: 800,
    margin: '0 auto',
    padding: 24,
    fontFamily: 'system-ui, sans-serif',
  },
  title: {
    marginBottom: 16,
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
    padding: '6px 12px',
    border: '1px solid #ccc',
    borderRadius: 6,
    textDecoration: 'none',
    color: '#333',
    fontSize: 14,
  },
  activeBtn: {
    marginRight: 8,
    padding: '6px 12px',
    borderRadius: 6,
    background: '#000',
    color: '#fff',
    textDecoration: 'none',
    fontSize: 14,
  },
  searchForm: {
    display: 'flex',
    gap: 8,
  },
  searchInput: {
    padding: 8,
    borderRadius: 6,
    border: '1px solid #ccc',
    width: 220,
  },
  searchBtn: {
    padding: '8px 14px',
    borderRadius: 6,
    border: 'none',
    background: '#000',
    color: '#fff',
    cursor: 'pointer',
  },
  card: {
    padding: '16px 0',
    borderBottom: '1px solid #eee',
  },
  cardTitle: {
    fontWeight: 600,
    textDecoration: 'none',
    color: '#000',
    display: 'block',
    marginBottom: 6,
  },
  text: {
    margin: '6px 0 10px',
    color: '#333',
  },
  meta: {
    fontSize: 12,
    color: '#666',
  },
  locked: {
    marginTop: 6,
    fontSize: 12,
    color: '#999',
  },
  pagination: {
    marginTop: 24,
    display: 'flex',
    gap: 12,
  },
};
