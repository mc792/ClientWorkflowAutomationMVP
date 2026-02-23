"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";


export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    const res =
      mode === "signup"
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (res.error) return setMsg(res.error.message);

    router.push("/dashboard");
  }

  return (
    <main style={{ marginTop: 26 }}>
      <p className="kicker mono">Sign in [ fast ]. Ship [ faster ].</p>
      <h1 className="h1">{mode === "signup" ? "Create account" : "Login"}</h1>
      <p className="lead">Use email + password to access your request dashboard.</p>

      <section className="card" style={{ maxWidth: 520 }}>
        <form onSubmit={handleSubmit} className="grid">
          <input
            className="input"
            type="email"
            placeholder="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            className="input"
            type="password"
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="row">
            <button className="button" disabled={loading} type="submit">
              {loading ? "..." : mode === "signup" ? "Sign up" : "Login"}
            </button>

            <button
              className="button secondary"
              type="button"
              onClick={() => setMode((m) => (m === "login" ? "signup" : "login"))}
            >
              {mode === "login" ? "Create an account" : "I already have an account"}
            </button>
          </div>

          {msg && <p className="error">{msg}</p>}
        </form>
      </section>
    </main>
  );
}