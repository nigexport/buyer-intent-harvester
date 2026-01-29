import FeedUI from "../components/FeedUI";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <main style={{ padding: 40 }}>
      <h1>Feed Test</h1>
      <FeedUI
        countries={["UK", "USA"]}
        currentDays={7}
        currentQuery=""
        currentCountry=""
        currentIndustry=""
        currentSourceType=""
      />
    </main>
  );
}
