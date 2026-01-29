import FeedUI from "../components/FeedUI";
import { getSupabase } from "../lib/supabase";

export const dynamic = "force-dynamic";

export default async function Page() {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("buyer_intents")
    .select("id")
    .limit(1);

  if (error) {
    return <pre>SUPABASE ERROR: {error.message}</pre>;
  }

  return (
    <main style={{ padding: 40 }}>
      <h1>Supabase OK</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </main>
  );
}
