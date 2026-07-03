import { getCachedBreaches, setCachedBreaches } from "./db.js";

const HIBP_API_KEY = process.env.HIBP_API_KEY;
const HIBP_URL = "https://haveibeenpwned.com/api/v3/breachedaccount";

// L'abonnement HIBP le moins cher autorise 10 requêtes/minute — on reste
// prudemment en dessous en espaçant les appels réels d'au moins 7 secondes,
// et un cache (24h) évite de rappeler HIBP pour un email déjà vérifié récemment.
const MIN_INTERVAL_MS = 7000;
let hibpQueue = Promise.resolve();
let lastHibpCall = 0;

function throttled(fn) {
  hibpQueue = hibpQueue.then(async () => {
    const wait = Math.max(0, lastHibpCall + MIN_INTERVAL_MS - Date.now());
    if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
    lastHibpCall = Date.now();
    return fn();
  });
  return hibpQueue;
}

function severityFor(dataClasses) {
  const lower = dataClasses.map((d) => d.toLowerCase());
  const sensitiveKeywords = ["password", "credit card", "bank account", "social security", "financ"];
  if (lower.some((d) => sensitiveKeywords.some((k) => d.includes(k)))) return "high";
  if (lower.length > 2) return "medium";
  return "low";
}

async function fetchFromHibp(email) {
  const res = await fetch(`${HIBP_URL}/${encodeURIComponent(email)}?truncateResponse=false`, {
    headers: {
      "hibp-api-key": HIBP_API_KEY,
      "User-Agent": "Veillo-App",
      "Accept": "application/vnd.haveibeenpwned.v3+json",
    },
  });

  if (res.status === 404) return [];
  if (!res.ok) throw new Error(`Erreur HaveIBeenPwned (${res.status})`);

  const data = await res.json();
  return data.map((breach) => ({
    name: breach.Title || breach.Name,
    year: new Date(breach.BreachDate).getFullYear(),
    exposedData: breach.DataClasses.map((d) => d.toLowerCase()),
    severity: severityFor(breach.DataClasses),
  }));
}

// --- Simulation utilisée en local quand HIBP_API_KEY n'est pas configurée ---
async function fetchMockBreaches() {
  await new Promise((resolve) => setTimeout(resolve, 600));
  return [
    { name: "LinkedIn", year: 2021, exposedData: ["email", "password"], severity: "high" },
    { name: "Adobe", year: 2019, exposedData: ["email"], severity: "medium" },
  ];
}

async function fetchBreaches(email) {
  if (!HIBP_API_KEY) return fetchMockBreaches();

  const cached = await getCachedBreaches(email);
  if (cached) return cached;

  const breaches = await throttled(() => fetchFromHibp(email));
  await setCachedBreaches(email, breaches);
  return breaches;
}

// --- Calcul du score de vulnérabilité à partir des fuites trouvées ---
function computeScore(breaches) {
  let score = 100;

  for (const breach of breaches) {
    if (breach.severity === "high") score -= 20;
    if (breach.severity === "medium") score -= 10;
    if (breach.severity === "low") score -= 5;

    if (breach.exposedData.some((d) => d.includes("password"))) score -= 8;
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
    if (breach.exposedData.some((d) => d.includes("password"))) {
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
