import { supabase } from '../lib/supabase';

const PAGE_SIZE = 20;

export default async function Home({
  searchParams,
}: {
  searchParams: { days?: string; page?: string; q?: string };
}) {
  /* -------------------------------
     1. Days toggle (7 / 14)
  -------------------------------- */
  const days = searchParams.days === '14' ? 14 : 7;

  const fromDate = new Date(
    Date.now() - days * 24 * 60 * 60 * 1000
  ).toISOString();

  /* -------------------------------
     2. Pagination
  -------------------------------- */
  const page = Number(searchParams.page || '1');
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  /* -------------------------------
     3. Search
  -------------------------------- */
  const searchQuery = searchParams.q?.trim();

  let query = supabase
    .from('buyer_intents')
    .select(
      `
      id,
      source_url,
      clean_text,
      company_name,
      request_category,
      country,
      location,
      created_at
    `,
      { count: 'exact' }
    )
    .gte('created_at', fromDate)
    .order('created_at', { ascending: false })
    .range(from, to);

  // Full-text-ish search (cheap MVP version)
  if (searchQuery) {
    query = query.ilike('clean_text', `%${searchQuery}%`);
  }

  const { data, error, count } = await query;

  if (error) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Error loading feed</h1>
        <pre>{JSON.stringify(error, null, 2)}</pre>
      </main>
    );
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Buyer Intent Feed</h1>

      {/* -------------------------------
          Controls
      -------------------------------- */}
      <div style={{ marginBottom: 16 }}>
        <a href={`/?days=7${searchQuery ? `&q=${searchQuery}` : ''}`} style={{ marginRight: 12 }}>
          Last 7 days
        </a>
        <a href={`/?days=14${searchQuery ? `&q=${searchQuery}` : ''}`}>
          Last 14 days
        </a>
      </div>

      {/* Search box */}
      <form method="get" style={{ marginBottom: 24 }}>
        <input
          type="text"
          name="q"
          defaultValue={searchQuery}
          placeholder="Search buyer requests..."
          style={{ padding: 8, width: 280 }}
        />
        <input type="hidden" name="days" value={days} />
        <button type="submit" style={{ marginLeft: 8 }}>
          Search
        </button>
      </form>

      {data?.length === 0 && <p>No results yet.</p>}

      {/* -------------------------------
          Feed
      -------------------------------- */}
      {data
        ?.filter(
          item =>
            typeof item.source_url === 'string' &&
            item.source_url.startsWith('http')
        )
        .map(item => (
          <div
            key={item.id}
            style={{
              borderBottom: '1px solid #ddd',
              padding: '16px 0',
            }}
          >
            {(() => {
              let url = item.source_url;

              // Fallback: extract URL from JSON-like clean_text
              if (!url && item.clean_text?.startsWith('{')) {
                try {
                  const parsed = JSON.parse(item.clean_text);
                  if (parsed.source_url) url = parsed.source_url;
                } catch {}
              }

              const title = (item.request_category || 'Buyer Request').replace(
                /^=+/,
                ''
              );

              return url ? (
                <a href={url} target="_blank" rel="noopener noreferrer">
                  <strong>{title}</strong>
                </a>
              ) : (
                <strong>{title}</strong>
              );
            })()}

            <p>
              {item.clean_text
                ?.replace(/^=+/, '')
                .replace(/^\{.*"source_url".*\}$/, '')}
            </p>

            <small>
              {item.country || 'Unknown country'} ·{' '}
              {new Date(item.created_at).toLocaleDateString()}
            </small>

            <div style={{ marginTop: 8, color: '#999' }}>
              🔒 Contact details available for paid users
            </div>
          </div>
        ))}

      {/* -------------------------------
          Pagination
      -------------------------------- */}
      <div style={{ marginTop: 24 }}>
        {page > 1 && (
          <a
            href={`/?days=${days}&page=${page - 1}${
              searchQuery ? `&q=${searchQuery}` : ''
            }`}
            style={{ marginRight: 16 }}
          >
            ← Previous
          </a>
        )}

        {data && data.length === PAGE_SIZE && (
          <a
            href={`/?days=${days}&page=${page + 1}${
              searchQuery ? `&q=${searchQuery}` : ''
            }`}
          >
            Next →
          </a>
        )}
      </div>
    </main>
  );
}
