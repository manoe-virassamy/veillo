import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Nav() {
  const { user, logout } = useAuth();

  return (
    <nav>
      <Link to="/" className="logo" style={{ textDecoration: "none" }}>
        <span className="logo-dot" />
        <span className="serif">ShieldMe</span>
      </Link>
      <div className="links">
        <Link to="/comment-ca-marche">Comment ça marche</Link>
        <Link to="/tarifs">Tarifs</Link>
        <Link to="/familles">Pour les familles</Link>
        {user ? (
          <Link to="/dashboard" className="nav-account">Mon compte</Link>
        ) : (
          <Link to="/connexion" className="nav-account">Se connecter</Link>
        )}
      </div>
    </nav>
  );
}
