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

export default async function Home({
  searchParams,
}: {
  searchParams: {
    days?: string;
    page?: string;
    q?: string;
    country?: string;
    industry?: string;
    source_type?: string;
  };
}) {
  /* -----------------------
     Params
  ------------------------ */
  const days = searchParams.days === '14' ? 14 : 7;
  const page = Number(searchParams.page || '1');
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const fromDate = new Date(
    Date.now() - days * 24 * 60 * 60 * 1000
  ).toISOString();

  /* -----------------------
     Main query
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

  if (searchParams.country) query = query.eq('country', searchParams.country);
  if (searchParams.industry) query = query.eq('industry', searchParams.industry);
  if (searchParams.source_type) query = query.eq('source_type', searchParams.source_type);

  const { data, error } = await query;
  if (error) return <pre>{JSON.stringify(error, null, 2)}</pre>;

  const items = (data || []).filter(
    i => i.clean_text && !i.clean_text.startsWith('{') && i.clean_text.length > 40
  ) as BuyerIntent[];

  /* -----------------------
     Countries
  ------------------------ */
  const { data: countryRows } = await supabase
    .from('buyer_intents')
    .select('country')
    .not('country', 'is', null);

  const countries = Array.from(
    new Set((countryRows || []).map(r => r.country))
  ).sort();

  /* -----------------------
     Popular keywords
  ------------------------ */
  const { data: keywords } = await supabase
    .from('popular_keywords_7d')
    .select('*');

  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <h1>Buyer Intent Feed</h1>

      <FeedUI
        countries={countries}
        keywords={keywords || []}
        currentDays={days}
        currentQuery={searchParams.q}
        currentCountry={searchParams.country}
        currentIndustry={searchParams.industry}
        currentSourceType={searchParams.source_type}
        page={page}
        pageSize={PAGE_SIZE}
        hasNext={items.length === PAGE_SIZE}
      />

      {items.length === 0 && <p>No results found.</p>}

      {items.map(item => (
        <div key={item.id} style={{ padding: '16px 0', borderBottom: '1px solid #eee' }}>
          <a
            href={item.source_url || '#'}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontWeight: 600, textDecoration: 'none', color: '#000' }}
          >
            {item.request_category || 'Buyer Request'}
          </a>

          <p>{item.clean_text}</p>

          <small style={{ color: '#666' }}>
            {item.country || 'Unknown'} · {item.industry || 'General'} ·{' '}
            {item.source_type || 'Web'} ·{' '}
            {new Date(item.created_at).toLocaleDateString()}
          </small>

          <div style={{ color: '#999', fontSize: 12 }}>
            🔒 Contact details available for paid users
          </div>
        </div>
      ))}
    </main>
  );
}
