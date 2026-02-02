import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getMovie } from "../services/api";

export default function MovieDetailPage() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);

  useEffect(() => {
    getMovie(id).then(setMovie);
  }, [id]);

  if (!movie) return <div style={{ padding: 16 }}>Loading...</div>;

  return (
    <div style={{ padding: 16 }}>
      <h2>{movie.title}</h2>
      <div>{movie.description}</div>
      <div>Duration: {movie.duration}</div>
      {movie.image ? <img src={movie.image} alt="movie" style={{ maxWidth: 300 }} /> : null}
    </div>
  );
}
