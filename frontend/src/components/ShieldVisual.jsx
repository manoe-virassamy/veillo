function scoreColor(score) {
  if (score === null || score === undefined) return "var(--sage)";
  if (score >= 70) return "#2D4F3E";
  if (score >= 40) return "#C97A3A";
  return "#C9483A";
}

export default function ShieldVisual({ score = null, tags, loading = false }) {
  const hasScore = score !== null && score !== undefined;

  const defaultTags = [
    { label: "2 fuites détectées", color: "#C9483A" },
    { label: "Mot de passe exposé", color: "var(--coral)" },
    { label: "2FA recommandée", color: "var(--sage-light)" },
  ];
  const displayTags = tags || (hasScore ? defaultTags : []);

  return (
    <div className="shield-visual">
      <div className="ring ring-1" style={loading ? { animationDuration: "1.2s" } : {}} />
      <div className="ring ring-2" style={loading ? { animationDuration: "1.2s", animationDelay: "0.15s" } : {}} />
      <div className="ring ring-3" style={loading ? { animationDuration: "1.2s", animationDelay: "0.3s" } : {}} />
      <div className="core" style={{ background: scoreColor(score) }}>
        {loading ? (
          <>
            <div className="score serif" style={{ fontSize: "20px", opacity: 0.7 }}>···</div>
            <div className="score-label">Scan en cours</div>
          </>
        ) : hasScore ? (
          <>
            <div className="score serif">{score}</div>
            <div className="score-label">Score sur 100</div>
          </>
        ) : (
          <>
            <div className="score serif" style={{ opacity: 0.5 }}>—</div>
            <div className="score-label">/ 100</div>
          </>
        )}
      </div>
      {displayTags.map((tag, i) => (
        <div className={`float-tag tag-${i + 1}`} key={tag.label}>
          <span className="dot" style={{ background: tag.color }} />
          {tag.label}
        </div>
      ))}
    </div>
  );
}
