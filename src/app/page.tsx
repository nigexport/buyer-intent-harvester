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

  const { data } = await query;

  /* -----------------------
     Country list
  ------------------------ */
  const { data: countryRows } = await supabase
    .from('buyer_intents')
    .select('country')
    .not('country', 'is', null);

  const countries = Array.from(
    new Set(countryRows?.map(r => r.country))
  ).sort();

  return (
    <main style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <h1>Buyer Intent Feed</h1>

      <FeedUI
        countries={countries}
        currentDays={days}
        currentCountry={searchParams.country}
        currentQuery={searchParams.q}
      />

      {data?.length === 0 && <p>No results found.</p>}

      {data?.map(item => (
        <div key={item.id} style={{ marginBottom: 16 }}>
          <a href={item.source_url} target="_blank">
            <strong>{item.request_category || 'Buyer Request'}</strong>
          </a>
          <p>{item.clean_text}</p>
          <small>
            {item.country || 'Unknown'} ·{' '}
            {new Date(item.created_at).toLocaleDateString()}
          </small>
          <div style={{ color: '#999', fontSize: 12 }}>
            🔒 Contact details for paid users
          </div>
        </div>
      ))}
    </main>
  );
}
