import { FormEvent, useState } from 'react';
import { CategorieView } from './features/categorie/categorie.view';
import { UtilisateurView } from './features/utilisateur/utilisateur.view';

type View = 'login' | 'demo' | "categorie" | "utilisateur";

const tableLinks = [
  { label: "Categorie", route: "categorie" },
    { label: "Utilisateur", route: "utilisateur" }
];

export function App() {
  const [view, setView] = useState<View>('login');
  const [login, setLogin] = useState('dieng.tech');
  const [password, setPassword] = useState('dieng123');
  const [error, setError] = useState('');

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
            <strong>Test React1</strong>
            <small>Application React generee en MVC</small>
          </div>
        </div>
        <nav>
          <button className={view === 'demo' ? 'active' : ''} onClick={() => setView('demo')}>Demo</button>
          {tableLinks.map((link) => (
            <button key={link.route} className={view === link.route ? 'active' : ''} onClick={() => setView(link.route as View)}>
              {link.label}
            </button>
          ))}
          <button className={view === 'login' ? 'active' : ''} onClick={() => setView('login')}>Login</button>
        </nav>
      </aside>

      <main className="content">
        {view === 'login' && (
          <form className="login-card" onSubmit={submitLogin}>
            <p>Acces demo</p>
            <h1>Test React1</h1>
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
              <span>Chaque table possede maintenant son modele, service, controller, vue TSX et fichier CSS.</span>
            </section>
            <section className="screen-grid">
              {tableLinks.map((link) => (
                <button key={link.route} onClick={() => setView(link.route as View)}>
                  <strong>{link.label}</strong>
                  <span>Module MVC React dedie</span>
                </button>
              ))}
            </section>
          </>
        )}

        {view === "categorie" && <CategorieView />}
        {view === "utilisateur" && <UtilisateurView />}
      </main>
    </div>
  );
}
