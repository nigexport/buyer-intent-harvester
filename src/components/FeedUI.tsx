import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";

export default function FeedUI({
  initialQuery,
  initialResults,
  hasMore,
}: any) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery ?? "");
  const [results, setResults] = useState(initialResults ?? []);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const debounceRef = useRef<any>(null);
  const observerRef = useRef<HTMLDivElement>(null);

  /* 🔁 Debounced search */
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      router.push({ pathname: "/", query: { q: query } });
    }, 400);
  }, [query]);

  /* 🔽 Infinite scroll */
  useEffect(() => {
    if (!hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          setLoading(true);
          fetch(`/?q=${query}&page=${page + 1}`)
            .then((r) => r.text())
            .then(() => setPage((p) => p + 1))
            .finally(() => setLoading(false));
        }
      },
      { threshold: 1 }
    );

    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [page, hasMore]);

  /* ⭐ Save search */
  function saveSearch() {
    const saved = JSON.parse(localStorage.getItem("saved_searches") || "[]");
    localStorage.setItem(
      "saved_searches",
      JSON.stringify([...new Set([...saved, query])])
    );
    alert("Search saved");
  }

  /* 🎯 Highlight keywords */
  function highlight(text: string) {
    if (!query) return text;
    const re = new RegExp(`(${query})`, "gi");
    return text.replace(re, "<mark>$1</mark>");
  }

  return (
    <>
      <input
        placeholder="Search buyer intent…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <button onClick={saveSearch}>Save search</button>

      {results.map((r: any) => (
        <div key={r.id} className="card">
          <a href={r.source_url} target="_blank">
            {r.request_category || "Buyer Intent"}
          </a>
          <p
            dangerouslySetInnerHTML={{
              __html: highlight(r.clean_text),
            }}
          />
          <small>{r.industry || "Other"}</small>
        </div>
      ))}

      <div ref={observerRef} />

      <style jsx>{`
        input {
          width: 100%;
          padding: 10px;
          margin-bottom: 8px;
        }
        .card {
          border-bottom: 1px solid #eee;
          padding: 12px 0;
        }
        mark {
          background: yellow;
        }
      `}</style>
    </>
  );
}
