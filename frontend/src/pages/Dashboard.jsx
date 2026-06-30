import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const planLabels = { free: 'Gratuit', pro: 'Pro', famille: 'Famille' };
const planColors = { free: 'var(--ink-soft)', pro: 'var(--sage)', famille: 'var(--coral)' };

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <>
      <section className="dashboard">
        <div className="dashboard-header">
          <div>
            <div className="eyebrow">Tableau de bord</div>
            <h1 className="serif">Bonjour, {user.email.split('@')[0]}</h1>
          </div>
          <button className="logout-btn" onClick={handleLogout}>Se déconnecter</button>
        </div>

        <div className="dashboard-grid">
          <div className="dash-card">
            <div className="dash-card-label">Ton plan</div>
            <div className="dash-plan" style={{ color: planColors[user.plan] }}>
              {planLabels[user.plan]}
            </div>
            {user.plan === 'free' && (
              <Link to="/tarifs" className="upgrade-btn">Passer au Pro →</Link>
            )}
          </div>

          <div className="dash-card">
            <div className="dash-card-label">Email surveillé</div>
            <div className="dash-email">{user.email}</div>
            {user.plan !== 'free' && (
              <p className="dash-note">Surveillance active — on t'alertera en cas de fuite.</p>
            )}
            {user.plan === 'free' && (
              <p className="dash-note">Passe au plan Pro pour activer la surveillance continue.</p>
            )}
          </div>

          <div className="dash-card">
            <div className="dash-card-label">Dernière vérification</div>
            <div className="dash-email" style={{ fontSize: '15px', opacity: 0.5 }}>Aucune pour l'instant</div>
            <Link to="/" className="upgrade-btn" style={{ borderColor: 'var(--line)', color: 'var(--ink)' }}>
              Vérifier mon email →
            </Link>
          </div>

          {user.plan === 'famille' && (
            <div className="dash-card">
              <div className="dash-card-label">Membres de la famille</div>
              <div className="dash-email" style={{ fontSize: '15px', opacity: 0.5 }}>Aucun membre ajouté</div>
              <button className="upgrade-btn">Inviter un proche →</button>
            </div>
          )}
        </div>
      </section>

      <footer>
        <div>ShieldMe</div>
        <div>Fait avec soin à Paris</div>
      </footer>
    </>
  );
}
