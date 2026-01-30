import { useRouter } from "next/router";

export default function FeedUI(props: any) {
  const router = useRouter();

  function nav(params: any) {
    window.scrollTo({ top: 0, behavior: "smooth" });
    router.push({ pathname: "/", query: { ...router.query, ...params, page: 1 } });
  }

  return (
    <div className="filters">
      <input
        placeholder="Search…"
        defaultValue={props.currentQuery}
        onKeyDown={(e) =>
          e.key === "Enter" && nav({ q: e.currentTarget.value })
        }
      />

      <div className="chips">
        {[7, 14, 30].map((d) => (
          <button key={d} onClick={() => nav({ days: d })}>
            {d} days
          </button>
        ))}
      </div>

      <select onChange={(e) => nav({ country: e.target.value })}>
        <option value="">All Countries</option>
        {props.countries.map((c: string) => (
          <option key={c}>{c}</option>
        ))}
      </select>

      <select onChange={(e) => nav({ industry: e.target.value })}>
        <option value="">All Industries</option>
        {props.industries.map((i: string) => (
          <option key={i}>{i}</option>
        ))}
      </select>

      <select onChange={(e) => nav({ source: e.target.value })}>
        <option value="">All Sources</option>
        {props.sources.map((s: string) => (
          <option key={s}>{s}</option>
        ))}
      </select>

      <div className="chips">
        {props.popularKeywords.map((k: string) => (
          <button key={k} onClick={() => nav({ q: k })}>
            {k}
          </button>
        ))}
      </div>
    </div>
  );
}
