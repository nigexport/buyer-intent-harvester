import { supabase } from '../lib/supabase';

export default async function Home() {
  const sevenDaysAgo = new Date(
    Date.now() - 7 * 24 * 60 * 60 * 1000
  ).toISOString();

  const { data, error } = await supabase
    .from('buyer_intents')
    .select(`
      id,
      source_url,
      clean_text,
      company_name,
      request_category,
      country,
      location,
      created_at
    `)
    .gte('created_at', sevenDaysAgo)
    .order('created_at', { ascending: false })
    .limit(50);

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
      <h1>Buyer Intent Feed (Last 7 Days)</h1>

      {data?.length === 0 && <p>No results yet.</p>}

      {data?.map(item => (
        <div
          key={item.id}
          style={{
            borderBottom: '1px solid #ddd',
            padding: '16px 0'
          }}
        >
          <a href={item.source_url} target="_blank" rel="noopener noreferrer">
            <strong>
              {(item.request_category || 'Buyer Request').replace(/^=+/, '')}
            </strong>
          </a>

          <p>{item.clean_text?.replace(/^=+/, '')}</p>

          <small>
            {item.country || 'Unknown country'} ·{' '}
            {new Date(item.created_at).toLocaleDateString()}
          </small>

          <div style={{ marginTop: 8, color: '#999' }}>
            🔒 Contact details available for paid users
          </div>
        </div>
      ))}
    </main>
  );
}
