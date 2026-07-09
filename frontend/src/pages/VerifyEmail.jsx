import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Footer from '../components/Footer';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    if (!token) { setStatus('error'); return; }
    fetch(`${API_URL}/api/auth/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then(r => setStatus(r.ok ? 'done' : 'error'))
      .catch(() => setStatus('error'));
  }, [token]);

  return (
    <>
      <section className="auth-page">
        <div className="auth-box" style={{ textAlign: 'center' }}>
          {status === 'loading' && (
            <>
              <div className="eyebrow">Confirmation en cours</div>
              <h1 className="serif">Un instant...</h1>
            </>
          )}
          {status === 'done' && (
            <>
              <div className="eyebrow">C'est fait</div>
              <h1 className="serif">Email confirmé</h1>
              <p className="lead" style={{ marginBottom: '32px' }}>Ton adresse email est bien vérifiée.</p>
              <Link to="/dashboard" className="auth-btn" style={{ display: 'inline-block', textDecoration: 'none' }}>
                Aller sur mon tableau de bord
              </Link>
            </>
          )}
          {status === 'error' && (
            <>
              <div className="eyebrow">Lien invalide</div>
              <h1 className="serif">Ce lien est invalide ou a expiré</h1>
              <p className="lead">
                Connecte-toi puis renvoie un email de confirmation depuis ton tableau de bord.
              </p>
            </>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}
