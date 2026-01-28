import { supabase } from '../lib/supabase';
import FeedUI from '../components/FeedUI';

const PAGE_SIZE = 15;

type BuyerIntent = {
  id: number;
  source_url: string | null;
  clean_text: string | null;
  request_category: string | null;
  industry: string | null;
  country: string | null;
  source_type: string | null;
  created_at: string;
};

type PopularKeyword = {
  keyword: string;
  total: number;
};

export default async function Home({
  searchParams,
}: {
  searchParams: {
    days?: string;
    page?: string;
    q?: string;
    country?: string;
    source_type?: string;
    industry?: string;
  };
}) {
  /* -----------------------
     Pagination & date
  ------------------------ */
  const days = searchParams.days === '14' ? 14 : 7;
  const page = Number(searchParams.page || '1');
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const fromDate = new Date(
    Date.now() - days * 24 * 60 * 60 * 1000
  ).toISOString();

  /* -----------------------
     Base query
  ------------------------ */
  let query = supabase
    .from('buyer_intents')
    .select(
      `
      id,
      source_url,
      clean_text,
      request_category,
      industry,
      country,
      source_type,
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

  if (searchParams.industry) {
    query = query.eq('industry', searchParams.industry);
  }

  if (searchParams.source_type) {
    query = query.eq('source_type', searchParams.source_type);
  }

  const { data, error } = await query;
  const items: BuyerIntent[] = data ?? [];

  /* -----------------------
     Popular keywords
  ------------------------ */
  const { data: keywordsData } = await supabase
    .from('popular_keywords_7d')
    .select('*');

  const keywords: PopularKeyword[] = keywordsData ?? [];

  /* -----------------------
     Country dropdown
  ------------------------ */
  const { data: countryRows } = await supabase
    .from('buyer_intents')
    .select('country')
    .not('country', 'is', null);

  const countries = Array.from(
    new Set((countryRows ?? []).map(r => r.country).filter(Boolean))
  ).sort();

  if (error) {
    return (
      <main style={{ padding: 24 }}>
        <h2>Error loading feed</h2>
        <pre>{JSON.stringify(error, null, 2)}</pre>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <h1 style={{ marginBottom: 16 }}>Buyer Intent Feed</h1>

      <FeedUI
        countries={countries}
        keywords={keywords}
        currentDays={days}
        currentPage={page}
        currentQuery={searchParams.q}
        currentCountry={searchParams.country}
      />

      {/* Popular keywords */}
      {keywords.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <strong>Popular searches:</strong>
          <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {keywords.map(k => (
              <a
                key={k.keyword}
                href={`/?q=${encodeURIComponent(k.keyword)}`}
                style={keywordChip}
              >
                {k.keyword} ({k.total})
              </a>
            ))}
          </div>
        </div>
      )}

      {items.length === 0 && <p>No results found.</p>}

      {/* Feed list */}
      {items.map(item => {
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
                style={{ fontWeight: 600, color: '#000', textDecoration: 'none' }}
              >
                {title}
              </a>
            ) : (
              <strong>{title}</strong>
            )}

            {text && <p style={{ margin: '8px 0' }}>{text}</p>}

            <div style={{ fontSize: 12, color: '#666' }}>
              {item.industry || 'General'} · {item.source_type || 'web'}
            </div>

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

        {items.length === PAGE_SIZE && (
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

/* -----------------------
   Styles
------------------------ */
const pageBtn = {
  padding: '8px 14px',
  borderRadius: 8,
  border: '1px solid #ccc',
  textDecoration: 'none',
  color: '#000',
  background: '#fafafa',
  fontWeight: 500,
};

const keywordChip = {
  padding: '4px 10px',
  border: '1px solid #ddd',
  borderRadius: 12,
  fontSize: 13,
  textDecoration: 'none',
  color: '#000',
  background: '#fafafa',
};
