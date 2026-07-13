import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Footer from '../components/Footer';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function Unsubscribe() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    if (!token) { setStatus('error'); return; }
    fetch(`${API_URL}/api/waitlist/unsubscribe/${token}`, { method: 'POST' })
      .then(r => setStatus(r.ok ? 'done' : 'error'))
      .catch(() => setStatus('error'));
  }, [token]);

  return (
    <>
      <section className="auth-page">
        <div className="auth-box" style={{ textAlign: 'center' }}>
          {status === 'loading' && (
            <>
              <div className="eyebrow">Un instant</div>
              <h1 className="serif">Désinscription en cours...</h1>
            </>
          )}
          {status === 'done' && (
            <>
              <div className="eyebrow">C'est fait</div>
              <h1 className="serif">Tu es désinscrit(e)</h1>
              <p className="lead">Tu ne recevras plus d'email de notre part concernant la liste d'attente.</p>
            </>
          )}
          {status === 'error' && (
            <>
              <div className="eyebrow">Lien invalide</div>
              <h1 className="serif">Ce lien ne fonctionne pas</h1>
            </>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}
