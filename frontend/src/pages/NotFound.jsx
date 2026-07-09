import { Link } from "react-router-dom";
import Footer from "../components/Footer";

export default function NotFound() {
  return (
    <>
      <section className="auth-page">
        <div className="auth-box" style={{ textAlign: "center" }}>
          <div className="eyebrow">404</div>
          <h1 className="serif">Cette page n'existe pas</h1>
          <p className="lead" style={{ marginBottom: "32px" }}>
            Le lien est peut-être mal copié, ou la page a été déplacée.
          </p>
          <Link to="/" className="auth-btn" style={{ display: "inline-block", textDecoration: "none" }}>
            Retour à l'accueil
          </Link>
        </div>
      </section>

      <Footer />
    </>
  );
}
