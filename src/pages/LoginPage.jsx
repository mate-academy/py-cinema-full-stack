import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("admin.user@cinema.com");
  const [password, setPassword] = useState("1qazcde3");
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await signIn(email, password);
      alert("Logged in");
    } catch (err) {
      setError(err?.message || "Login failed");
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>Login</h2>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 8, maxWidth: 360 }}>
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email" />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="password"
          type="password"
        />
        <button type="submit">Sign in</button>
        {error ? <div style={{ color: "red" }}>{error}</div> : null}
      </form>
    </div>
  );
}
