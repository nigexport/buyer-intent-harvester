import { supabase } from '../lib/supabase';

function daysAgo(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

export default async function Home() {
  const { data, error } = await supabase
    .from('buyer_intents')
    .select('*')
    .limit(5);

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
            <strong>{item.request_category || 'Buyer Request'}</strong>
          </a>

          <p>{item.clean_text}</p>

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
