import React, { useEffect, useState } from "react";
import { getMovieSessions } from "../services/api";

export default function SessionsPage() {
  const [items, setItems] = useState([]);
  const [date, setDate] = useState("");
  const [movie, setMovie] = useState("");

  const load = async () => {
    const params = {};
    if (date) params.date = date;
    if (movie) params.movie = movie;

    const data = await getMovieSessions(params);
    setItems(Array.isArray(data) ? data : data.results || []);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <h2>Sessions</h2>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input value={date} onChange={(e) => setDate(e.target.value)} placeholder="YYYY-MM-DD" />
        <input value={movie} onChange={(e) => setMovie(e.target.value)} placeholder="movie id" />
        <button onClick={load}>Filter</button>
      </div>

      <ul>
        {items.map((s) => (
          <li key={s.id}>
            {s.show_time} — {s.movie_title || s.movie} — {s.cinema_hall_name || s.cinema_hall}
          </li>
        ))}
      </ul>
    </div>
  );
}
