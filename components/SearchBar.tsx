"use client";

import { handleError } from "@/lib/handleError";
import { useState } from "react";

export default function SearchBar({
  onResults,
}: {
  onResults: (items: any[]) => void;
}) {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  // const [error, setError] = useState<string | null>(null);

  async function go() {
    if (!q.trim()) return;
    setLoading(true);
    // setError(null);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "search_failed");
      onResults(data.items || []);
    } catch (e) {
      // setError(e.message);
      handleError(e);
    } finally {
      setLoading(false);
    }
  }
  function clearSearch() {
    setQ("");
  }

  return (
    <div className="flex gap-2 relative">
      <input
        type="text"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && go()}
        className="flex-1 rounded-xl border border-neutral-800 bg-neutral-900 p-3 pr-5 outline-none focus:border-neutral-700"
        placeholder="Search songs…"
      />
      {q && (
        <button
          onClick={clearSearch}
          className="absolute right-14 top-1/2 -translate-y-1/2 rounded-xl px-4 py-2"
          aria-label="Clear search"
        >
          &times;
        </button>
      )}
      <button
        onClick={go}
        className="rounded-xl bg-white/10 px-4 py-1 hover:bg-white/20"
      >
        {loading ? "🔎.." : "GO"}
      </button>
      {/* {error && <div className="text-red-400">{error}</div>} */}
    </div>
  );
}
