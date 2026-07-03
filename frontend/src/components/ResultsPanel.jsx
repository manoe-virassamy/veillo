function scoreColor(score) {
  if (score >= 70) return "#2D4F3E";
  if (score >= 40) return "#C97A3A";
  return "#C9483A";
}

export default function ResultsPanel({ result, email, onReset }) {
  if (!result) return null;

  return (
    <section className="results" id="resultsSection">
      <div className="results-header">
        <div className="eyebrow">Résultat pour <strong>{email}</strong></div>
        <h2 className="serif">Voici ce qu'on a trouvé</h2>
        <button className="reset-btn" onClick={onReset}>Vérifier un autre email →</button>
      </div>

      <div className="results-grid">
        <div className="score-card" style={{ background: scoreColor(result.score) }}>
          <div className="big-score serif">
            {result.score}
            <span>/100</span>
          </div>
          <div className="score-tag">{result.label}</div>
          <p>
            Ton email apparaît dans {result.breachCount} fuite{result.breachCount > 1 ? "s" : ""} de données connue{result.breachCount > 1 ? "s" : ""}.
            Rien d'alarmant si tu suis nos recommandations dans les prochains jours.
          </p>
        </div>

        <div className="findings">
          {result.findings.map((finding, i) => (
            <div className={`finding ${finding.severity}`} key={i}>
              <div className="finding-icon">{finding.icon}</div>
              <div className="finding-content">
                <h3>{finding.title}</h3>
                <p>{finding.description}</p>
                <details className="finding-action">
                  <summary>{finding.action} →</summary>
                  <ul className="finding-tips">
                    {finding.tips.map((tip, ti) => <li key={ti}>{tip}</li>)}
                  </ul>
                </details>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
