"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

type RequestRow = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: "NEW" | "IN_PROGRESS" | "DONE";
  priority: number;
  created_at: string;
};

export default function DashboardPage() {
  const router = useRouter();

  const [userId, setUserId] = useState<string | null>(null);
  const [rows, setRows] = useState<RequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState(2);

  // filter
  const [statusFilter, setStatusFilter] = useState<"ALL" | RequestRow["status"]>("ALL");

  const filteredRows = useMemo(() => {
    if (statusFilter === "ALL") return rows;
    return rows.filter((r) => r.status === statusFilter);
  }, [rows, statusFilter]);

  const counters = useMemo(() => {
    const c = { NEW: 0, IN_PROGRESS: 0, DONE: 0 };
    for (const r of rows) c[r.status]++;
    return c;
  }, [rows]);

  async function load() {
    setLoading(true);
    setErrorMsg(null);

    const { data: sessionData } = await supabase.auth.getSession();
    const uid = sessionData.session?.user.id ?? null;

    if (!uid) {
      router.push("/login");
      return;
    }

    setUserId(uid);

    const { data, error } = await supabase
      .from("requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) setErrorMsg(error.message);
    setRows((data as RequestRow[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.push("/login");
    });

    return () => {
      sub.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function createRequest(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    if (!userId) return;

    const { error } = await supabase.from("requests").insert({
      user_id: userId,
      title,
      description: description || null,
      priority,
      status: "NEW",
    });

    if (error) return setErrorMsg(error.message);

    setTitle("");
    setDescription("");
    setPriority(2);
    await load();
  }

  async function updateStatus(id: string, status: RequestRow["status"]) {
    setErrorMsg(null);
    const { error } = await supabase.from("requests").update({ status }).eq("id", id);
    if (error) return setErrorMsg(error.message);
    await load();
  }

  async function deleteRow(id: string) {
    setErrorMsg(null);
    const { error } = await supabase.from("requests").delete().eq("id", id);
    if (error) return setErrorMsg(error.message);
    await load();
  }

  async function logout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <main style={{ marginTop: 26 }}>
        <p className="kicker mono">Built for people [ not spreadsheets ].</p>

        <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
            <h1 className="h1">Dashboard</h1>
            <p className="lead" style={{ marginBottom: 0 }}>
            Track requests, update status, keep things moving.
            </p>

            <div className="row" style={{ marginTop: 12 }}>
            <span className="badge mono">NEW {counters.NEW}</span>
            <span className="badge mono">IN_PROGRESS {counters.IN_PROGRESS}</span>
            <span className="badge mono">DONE {counters.DONE}</span>
            </div>
        </div>

        <button className="button secondary" onClick={logout}>
            Logout
        </button>
        </div>

        <div className="hr" />

        <section className="row" style={{ justifyContent: "space-between" }}>
        <div className="row">
            <span className="kicker">Filter</span>
            <select className="select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}>
            <option value="ALL">ALL</option>
            <option value="NEW">NEW</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="DONE">DONE</option>
            </select>
        </div>

        <span className="small mono">RLS: auth.uid() = user_id</span>
        </section>

        <section className="card" style={{ marginTop: 14 }}>
        <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
            <div>
            <div className="item-title">New Request</div>
            <div className="small">Capture it now, refine later.</div>
            </div>
        </div>

        <div className="hr" />

        <form onSubmit={createRequest} className="grid">
            <input className="input" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />

            <textarea
            className="textarea"
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            />

            <div className="row">
            <label className="small" style={{ minWidth: 220 }}>
                Priority (1=high, 3=low)
            </label>
            <input
                className="input"
                style={{ maxWidth: 160 }}
                type="number"
                min={1}
                max={3}
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value))}
            />

            <button className="button" type="submit">
                Create
            </button>
            </div>
        </form>
        </section>

        <section style={{ marginTop: 14 }}>
        <div className="row" style={{ justifyContent: "space-between", alignItems: "baseline" }}>
            <div className="item-title">My Requests</div>
            {loading && <span className="small">Loading...</span>}
        </div>

        {errorMsg && <p className="error">{errorMsg}</p>}
        {!loading && filteredRows.length === 0 && <p className="small">No requests yet.</p>}

        <ul className="list" style={{ marginTop: 12 }}>
            {filteredRows.map((r) => (
            <li key={r.id} className="card">
                <div className="item">
                <div>
                    <div className="item-title">{r.title}</div>
                    <div className="small" style={{ marginTop: 6 }}>
                    {r.description || <em>No description</em>}
                    </div>
                    <div className="item-meta mono">
                    Priority: {r.priority} · Created: {new Date(r.created_at).toLocaleString()}
                    </div>
                </div>

                <div className="right">
                    <select className="select" value={r.status} onChange={(e) => updateStatus(r.id, e.target.value as any)}>
                    <option value="NEW">NEW</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="DONE">DONE</option>
                    </select>

                    <button className="button danger" onClick={() => deleteRow(r.id)}>
                    Delete
                    </button>
                </div>
                </div>
            </li>
            ))}
        </ul>
        </section>
    </main>
    );
}