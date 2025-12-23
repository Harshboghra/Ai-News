import { useState } from "react";
import SearchBox from "./SearchBox";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function NewsSearch() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  async function handleSearch(value) {
    setLoading(true);

    const res = await fetch(
      `${API}/api/news/search?q=${encodeURIComponent(value)}`
    );
    const data = await res.json();

    setResults(data.results || []);
    setLoading(false);
  }

  return (
    <>
      <SearchBox onSearch={handleSearch} />

      {loading && <p>Loading...</p>}

      <div className="mt-4 space-y-3">
        {results.map((item) => (
          <div key={item._id} className="border p-3">
            <h3 className="font-semibold">{item.title}</h3>
            <p className="text-sm text-gray-600">{item.source}</p>
          </div>
        ))}
      </div>
    </>
  );
}
