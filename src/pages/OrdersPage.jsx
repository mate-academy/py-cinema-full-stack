import React, { useEffect, useState } from "react";
import { createOrder, getOrders } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function OrdersPage() {
  const { isAuthed } = useAuth();
  const [orders, setOrders] = useState([]);
  const [movieSession, setMovieSession] = useState("");
  const [row, setRow] = useState("1");
  const [seat, setSeat] = useState("1");

  const load = async () => {
    if (!isAuthed) return;
    const data = await getOrders();
    setOrders(Array.isArray(data) ? data : data.results || []);
  };

  useEffect(() => {
    load();
  }, [isAuthed]);

  const onCreate = async () => {
    const tickets = [
      {
        movie_session: Number(movieSession),
        row: Number(row),
        seat: Number(seat),
      },
    ];
    await createOrder(tickets);
    await load();
    alert("Order created");
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>Orders</h2>

      {!isAuthed ? (
        <div>Login required</div>
      ) : (
        <>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <input
              value={movieSession}
              onChange={(e) => setMovieSession(e.target.value)}
              placeholder="movie_session id"
            />
            <input value={row} onChange={(e) => setRow(e.target.value)} placeholder="row" />
            <input value={seat} onChange={(e) => setSeat(e.target.value)} placeholder="seat" />
            <button onClick={onCreate}>Create order</button>
          </div>

          <ul>
            {orders.map((o) => (
              <li key={o.id}>
                Order #{o.id} — tickets: {o.tickets?.length || 0} — {o.created_at}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
