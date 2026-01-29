export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { supabase } from '../lib/supabase';
import FeedUI from '../components/FeedUI';

const PAGE_SIZE = 15;

export default async function Page({
  searchParams,
}: {
  searchParams: {
    days?: string;
    q?: string;
    country?: string;
    industry?: string;
    source_type?: string;
  };
}) {
  const days = searchParams.days === '14' ? 14 : 7;

  const fromDate = new Date(
    Date.now() - days * 24 * 60 * 60 * 1000
  ).toISOString();

  let query = supabase
    .from('buyer_intents')
    .select('*')
    .gte('created_at', fromDate)
    .order('created_at', { ascending: false })
    .limit(PAGE_SIZE);

  if (searchParams.q) {
    query = query.or(
      `clean_text.ilike.%${searchParams.q}%,request_category.ilike.%${searchParams.q}%`
    );
  }

  if (searchParams.country) query = query.eq('country', searchParams.country);
  if (searchParams.industry) query = query.eq('industry', searchParams.industry);
  if (searchParams.source_type) query = query.eq('source_type', searchParams.source_type);

  const { data } = await query;

  const { data: countryRows } = await supabase
    .from('buyer_intents')
    .select('country')
    .not('country', 'is', null);

  const countries = Array.from(
    new Set((countryRows ?? []).map(r => r.country))
  );

  const { data: keywordRows } = await supabase
    .from('popular_keywords_7d')
    .select('keyword,total')
    .order('total', { ascending: false });

  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <h1>Buyer Intent Feed</h1>

      <FeedUI
        countries={countries}
        keywords={keywordRows ?? []}
        currentDays={days}
        currentQuery={searchParams.q}
        currentCountry={searchParams.country}
        currentIndustry={searchParams.industry}
        currentSourceType={searchParams.source_type}
      />

      {(data ?? []).map(item => (
        <div key={item.id} style={{ padding: '16px 0', borderBottom: '1px solid #eee' }}>
          <a
            href={item.source_url ?? '#'}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontWeight: 600, color: '#000', textDecoration: 'none' }}
          >
            {(item.request_category || 'Buyer Request').replace(/^=+/, '')}
          </a>

          <p>{item.clean_text?.replace(/^=+/, '')}</p>

          <small style={{ color: '#666' }}>
            {item.country || 'Unknown'} ·{' '}
            {new Date(item.created_at).toLocaleDateString()}
          </small>
        </div>
      ))}
    </main>
  );
}
