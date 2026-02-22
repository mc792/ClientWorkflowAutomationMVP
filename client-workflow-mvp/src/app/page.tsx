export default function Home() {
  return (
    <main>
      <p className="kicker mono">Built around [ you ]. Intended for [ use ].</p>

      <h1 className="h1">
        Client Workflow Automation <span className="mono">MVP</span>
      </h1>

      <p className="lead">
        A minimal request tracker: authentication, Postgres with RLS, and a CRUD dashboard.
      </p>

      <div className="row">
        <span className="badge mono">Auth</span>
        <span className="badge mono">RLS</span>
        <span className="badge mono">CRUD</span>
        <span className="badge mono">Deploy-ready</span>
      </div>

      <div className="hr" />

      <div className="card">
        <p className="small">
          Tip: open an incognito window and create a second user to verify RLS (each user sees only
          their own requests).
        </p>
      </div>
    </main>
  );
}