import { supabase } from '../lib/supabase';
import FeedUI from '../components/FeedUI';

const PAGE_SIZE = 15;

export default async function Home({
  searchParams,
}: {
  searchParams: {
    days?: string;
    page?: string;
    q?: string;
    country?: string;
  };
}) {
  const days = searchParams.days === '14' ? 14 : 7;
  const page = Number(searchParams.page || '1');
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const fromDate = new Date(
    Date.now() - days * 24 * 60 * 60 * 1000
  ).toISOString();

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

  if (searchParams.q) {
    query = query.or(
      `clean_text.ilike.%${searchParams.q}%,request_category.ilike.%${searchParams.q}%`
    );
  }

  if (searchParams.country) {
    query = query.eq('country', searchParams.country);
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

  /* -----------------------
     Country dropdown data
  ------------------------ */
  const { data: countryRows } = await supabase
    .from('buyer_intents')
    .select('country')
    .not('country', 'is', null);

  const countries = Array.from(
    new Set(countryRows?.map(r => r.country))
  ).sort();

  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <h1 style={{ marginBottom: 16 }}>Buyer Intent Feed</h1>

      <FeedUI
        countries={countries}
        currentDays={days}
        currentPage={page}
        currentQuery={searchParams.q}
        currentCountry={searchParams.country}
      />

      {data?.length === 0 && <p>No results found.</p>}

      {data?.map(item => {
        const title =
          item.request_category?.replace(/^=+/, '') || 'Buyer Request';

        const text =
          item.clean_text
            ?.replace(/^=+/, '')
            ?.replace(/^\{.*"source_url".*\}$/, '') || '';

        return (
          <div
            key={item.id}
            style={{
              padding: '16px 0',
              borderBottom: '1px solid #eee',
            }}
          >
            {item.source_url ? (
              <a
                href={item.source_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontWeight: 600,
                  color: '#000',
                  textDecoration: 'none',
                }}
              >
                {title}
              </a>
            ) : (
              <strong>{title}</strong>
            )}

            {text && <p style={{ margin: '8px 0' }}>{text}</p>}

            <small style={{ color: '#666' }}>
              {item.country || 'Unknown'} ·{' '}
              {new Date(item.created_at).toLocaleDateString()}
            </small>

            <div style={{ color: '#999', fontSize: 12, marginTop: 6 }}>
              🔒 Contact details available for paid users
            </div>
          </div>
        );
      })}

      {/* Pagination */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: 32,
        }}
      >
        {page > 1 && (
          <a
            href={`/?days=${days}&page=${page - 1}${
              searchParams.q ? `&q=${encodeURIComponent(searchParams.q)}` : ''
            }${searchParams.country ? `&country=${searchParams.country}` : ''}`}
            style={pageBtn}
          >
            ← Previous
          </a>
        )}

        {data && data.length === PAGE_SIZE && (
          <a
            href={`/?days=${days}&page=${page + 1}${
              searchParams.q ? `&q=${encodeURIComponent(searchParams.q)}` : ''
            }${searchParams.country ? `&country=${searchParams.country}` : ''}`}
            style={pageBtn}
          >
            Next →
          </a>
        )}
      </div>
    </main>
  );
}

const pageBtn = {
  padding: '8px 14px',
  borderRadius: 8,
  border: '1px solid #ccc',
  textDecoration: 'none',
  color: '#000',
  background: '#fafafa',
  fontWeight: 500,
};
