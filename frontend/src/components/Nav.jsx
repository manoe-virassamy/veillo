import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/Favicon.PNG";

export default function Nav() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <nav>
      <Link to="/" className="logo" style={{ textDecoration: "none" }} onClick={() => setOpen(false)}>
        <img src={logo} alt="" className="logo-icon" />
        <span className="logo-text">
          <span className="serif">Veillo</span>
          <span className="logo-tagline">Voir. Comprendre. Se protéger.</span>
        </span>
      </Link>
      <button
        className="nav-toggle"
        aria-label="Ouvrir le menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span />
        <span />
        <span />
      </button>
      <div className={`links${open ? " open" : ""}`} onClick={() => setOpen(false)}>
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
