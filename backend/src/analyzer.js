// Ce module simule pour l'instant ce que renverra l'API HaveIBeenPwned.
// Quand on branchera la vraie clé API, seule la fonction fetchBreaches()
// changera — tout le reste (scoring, recommandations) reste identique.

// --- Simulation de données de fuites (à remplacer par un vrai appel API) ---
async function fetchBreaches(email) {
  // Simule un délai réseau réaliste
  await new Promise((resolve) => setTimeout(resolve, 600));

  // Données fictives mais structurées comme la vraie API HIBP
  const mockDatabase = {
    default: [
      {
        name: "LinkedIn",
        year: 2021,
        exposedData: ["email", "password"],
        severity: "high",
      },
      {
        name: "Adobe",
        year: 2019,
        exposedData: ["email"],
        severity: "medium",
      },
    ],
  };

  // Pour la démo, tout email renvoie le même jeu de données mock
  return mockDatabase.default;
}

// --- Calcul du score de vulnérabilité à partir des fuites trouvées ---
function computeScore(breaches) {
  let score = 100;

  for (const breach of breaches) {
    if (breach.severity === "high") score -= 20;
    if (breach.severity === "medium") score -= 10;
    if (breach.severity === "low") score -= 5;

    if (breach.exposedData.includes("password")) score -= 8;
  }

  score = Math.max(0, Math.min(100, score));

  let label = "Excellente protection";
  if (score < 90) label = "Bonne protection";
  if (score < 70) label = "Vulnérabilité modérée";
  if (score < 40) label = "Vulnérabilité élevée";

  return { score, label };
}

// --- Génération des recommandations actionnables ---
function buildFindings(breaches) {
  const findings = breaches.map((breach) => {
    if (breach.exposedData.includes("password")) {
      return {
        severity: "high",
        icon: "🔓",
        title: `Mot de passe exposé — fuite ${breach.name} ${breach.year}`,
        description: `Un mot de passe associé à ce compte a été retrouvé dans la fuite ${breach.name}. S'il est encore utilisé ailleurs, change-le en priorité.`,
        action: "Voir comment le changer",
      };
    }
    return {
      severity: "medium",
      icon: "📧",
      title: `Email présent — fuite ${breach.name} ${breach.year}`,
      description: `Ton adresse apparaît dans cette fuite. Risque faible mais reste vigilant face aux emails suspects.`,
      action: "Comprendre le risque",
    };
  });

  // Recommandation systématique sur la 2FA
  findings.push({
    severity: "low",
    icon: "🛡️",
    title: "Authentification à deux facteurs",
    description:
      "Active la double authentification partout où c'est possible — la mesure la plus efficace contre le piratage de compte.",
    action: "Activer la 2FA",
  });

  return findings;
}

export async function analyzeEmail(email) {
  const breaches = await fetchBreaches(email);
  const { score, label } = computeScore(breaches);
  const findings = buildFindings(breaches);

  return {
    email,
    score,
    label,
    breachCount: breaches.length,
    findings,
  };
}
