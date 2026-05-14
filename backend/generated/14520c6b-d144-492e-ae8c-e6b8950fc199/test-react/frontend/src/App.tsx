import { FormEvent, useState } from 'react';
import { tables } from './tables';
import { TablePage } from './pages/TablePage';

type View = 'login' | 'demo' | string;

export function App() {
  const [view, setView] = useState<View>('login');
  const [login, setLogin] = useState('dieng.tech');
  const [password, setPassword] = useState('dieng123');
  const [error, setError] = useState('');
  const activeTable = tables.find((table) => table.routePath === view);

  function submitLogin(event: FormEvent) {
    event.preventDefault();
    if (login === 'dieng.tech' && password === 'dieng123') {
      setError('');
      setView('demo');
      return;
    }
    setError('Utilise le login dieng.tech et le mot de passe dieng123.');
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span>SF</span>
          <div>
            <strong>Test React</strong>
            <small>Application React generee</small>
          </div>
        </div>
        <nav>
          <button className={view === 'demo' ? 'active' : ''} onClick={() => setView('demo')}>Demo</button>
          {tables.map((table) => (
            <button key={table.routePath} className={view === table.routePath ? 'active' : ''} onClick={() => setView(table.routePath)}>
              {table.title}
            </button>
          ))}
          <button className={view === 'login' ? 'active' : ''} onClick={() => setView('login')}>Login</button>
        </nav>
      </aside>

      <main className="content">
        {view === 'login' && (
          <form className="login-card" onSubmit={submitLogin}>
            <p>Acces demo</p>
            <h1>Test React</h1>
            <label>Login<input value={login} onChange={(event) => setLogin(event.target.value)} /></label>
            <label>Mot de passe<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
            {error && <strong className="error">{error}</strong>}
            <button type="submit">Entrer</button>
          </form>
        )}

        {view === 'demo' && (
          <>
            <section className="page-hero">
              <p>Demo</p>
              <h1>Ecrans generes</h1>
              <span>Ouvre chaque module pour tester les listes, formulaires et actions CRUD.</span>
            </section>
            <section className="screen-grid">
              {tables.map((table) => (
                <button key={table.routePath} onClick={() => setView(table.routePath)}>
                  <strong>{table.title}</strong>
                  <span>CRUD pour la table {table.name}</span>
                </button>
              ))}
            </section>
          </>
        )}

        {activeTable && <TablePage table={activeTable} />}
      </main>
    </div>
  );
}
