import 'dotenv/config';
import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
// Patch Express pour rattraper automatiquement les erreurs des routes async
// (sans ça, une exception non gérée dans un handler async fait planter tout
// le process Node — déjà arrivé une fois avec Stripe, on ferme cette classe
// de bug une bonne fois pour toutes plutôt que route par route).
import "express-async-errors";
import { analyzeEmail } from "./analyzer.js";
import { saveCheck, getLatestCheck } from "./db.js";
import authRoutes, { JWT_SECRET } from "./routes/auth.js";
import stripeRoutes, { webhookRouter } from "./routes/stripe.js";
import waitlistRoutes from "./routes/waitlist.js";
import feedbackRoutes from "./routes/feedback.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
// Le webhook Stripe a besoin du corps brut pour vérifier la signature,
// donc il doit être monté avant express.json() qui parserait déjà le body.
app.use("/api/stripe", webhookRouter);
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/stripe", stripeRoutes);
app.use("/api/waitlist", waitlistRoutes);
app.use("/api/feedback", feedbackRoutes);

app.post("/api/check", async (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes("@")) {
    return res.status(400).json({ error: "Email invalide" });
  }
  try {
    const result = await analyzeEmail(email);

    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      try {
        const { userId } = jwt.verify(authHeader.slice(7), JWT_SECRET);
        await saveCheck({
          userId,
          email,
          score: result.score,
          label: result.label,
          breachCount: result.breachCount,
        });
      } catch {
        // token invalide ou expiré : on ignore, le check reste anonyme
      }
    }

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de l'analyse" });
  }
});

app.get("/api/check/latest", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Non authentifié" });
  }
  try {
    const { userId } = jwt.verify(authHeader.slice(7), JWT_SECRET);
    const check = await getLatestCheck(userId);
    res.json(check);
  } catch {
    res.status(401).json({ error: "Token invalide" });
  }
});

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// Filet de sécurité : toute erreur non gérée atterrit ici (grâce à
// express-async-errors) au lieu de faire planter le process.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Erreur serveur" });
});

app.listen(PORT, () => {
  console.log(`Veillo backend running on http://localhost:${PORT}`);
});
