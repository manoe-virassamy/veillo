import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer>
      <div>Veillo</div>
      <div className="footer-right">
        <div className="footer-links">
          <Link to="/mentions-legales">Mentions légales</Link>
          <Link to="/confidentialite">Confidentialité</Link>
          <Link to="/cgu">CGU</Link>
          <Link to="/cookies">Cookies</Link>
        </div>
        <div>Fait avec soin à Paris</div>
      </div>
    </footer>
  );
}
