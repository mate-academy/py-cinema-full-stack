import React from "react";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import MoviesPage from "./pages/MoviesPage";
import MovieDetailPage from "./pages/MovieDetailPage";
import SessionsPage from "./pages/SessionsPage";
import OrdersPage from "./pages/OrdersPage";
import LoginPage from "./pages/LoginPage";

function Nav() {
  const { isAuthed, signOut } = useAuth();

  return (
    <div style={{ display: "flex", gap: 12, padding: 12, borderBottom: "1px solid #ddd" }}>
      <Link to="/">Movies</Link>
      <Link to="/sessions">Sessions</Link>
      <Link to="/orders">Orders</Link>
      {!isAuthed ? <Link to="/login">Login</Link> : <button onClick={signOut}>Logout</button>}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Nav />
        <Routes>
          <Route path="/" element={<MoviesPage />} />
          <Route path="/movies/:id" element={<MovieDetailPage />} />
          <Route path="/sessions" element={<SessionsPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
