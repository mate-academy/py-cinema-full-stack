import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMovies } from "../services/api";

export default function MoviesPage() {
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState("");

  const load = async () => {
    const data = await getMovies(title ? { title } : {});
    setItems(Array.isArray(data) ? data : data.results || []);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <h2>Movies</h2>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="filter title" />
        <button onClick={load}>Search</button>
      </div>

      <ul>
        {items.map((m) => (
          <li key={m.id}>
            <Link to={`/movies/${m.id}`}>{m.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
