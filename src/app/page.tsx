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

          {(() => {
            // Prefer source_url
            let url = item.source_url;

            // Fallback: try to extract URL from JSON-like clean_text
            if (!url && item.clean_text?.startsWith('{')) {
              try {
                const parsed = JSON.parse(item.clean_text);
                if (parsed.source_url) url = parsed.source_url;
              } catch {}
            }

            const title = (item.request_category || 'Buyer Request').replace(/^=+/, '');

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
    </main>
  );
}
