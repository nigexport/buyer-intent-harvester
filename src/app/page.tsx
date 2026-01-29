export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

type Keyword = { keyword: string; total: number };

export default async function Page({
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
  const days = searchParams.days === '14' ? 14 : 7;
  const page = Number(searchParams.page ?? '1');
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const fromDate = new Date(
    Date.now() - days * 24 * 60 * 60 * 1000
  ).toISOString();

  let query = supabase
    .from('buyer_intents')
    .select('*')
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

  const { data } = await query;
  const items: BuyerIntent[] = data ?? [];

  const { data: countryRows } = await supabase
    .from('buyer_intents')
    .select('country')
    .not('country', 'is', null);

  const countries = Array.from(
    new Set((countryRows ?? []).map(r => r.country).filter(Boolean))
  ) as string[];

  const { data: keywordRows } = await supabase
    .from('popular_keywords_7d')
    .select('keyword,total')
    .order('total', { ascending: false });

  const keywords: Keyword[] = keywordRows ?? [];

  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <h1>Buyer Intent Feed</h1>

      <FeedUI
        countries={countries}
        keywords={keywords}
        currentDays={days}
        currentPage={page}
        currentQuery={searchParams.q}
        currentCountry={searchParams.country}
        currentIndustry={searchParams.industry}
        currentSourceType={searchParams.source_type}
      />

      {items.length === 0 && <p>No results found.</p>}

      {items.map(item => (
        <div key={item.id} style={{ borderBottom: '1px solid #eee', padding: '16px 0' }}>
          <a
            href={item.source_url ?? '#'}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontWeight: 600, textDecoration: 'none', color: '#000' }}
          >
            {(item.request_category || 'Buyer Request').replace(/^=+/, '')}
          </a>

          {item.clean_text && <p>{item.clean_text.replace(/^=+/, '')}</p>}

          <small style={{ color: '#666' }}>
            {item.country || 'Unknown'} ·{' '}
            {new Date(item.created_at).toLocaleDateString()}
          </small>
        </div>
      ))}
    </main>
  );
}
