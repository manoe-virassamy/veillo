import { useState, useEffect } from "react";

export default function CheckForm({ onCheck, loading, defaultEmail }) {
  const [email, setEmail] = useState(defaultEmail || "");

  useEffect(() => {
    if (defaultEmail) setEmail((prev) => prev || defaultEmail);
  }, [defaultEmail]);

  function handleSubmit(e) {
    e.preventDefault();
    if (!email) return;
    onCheck(email);
  }

  return (
    <>
      <form className="check-form" onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="ton.email@exemple.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Vérification..." : "Vérifier"}
        </button>
      </form>
      <p className="form-note">Aucune donnée stockée. Vérification anonyme et instantanée.</p>
    </>
  );
}
