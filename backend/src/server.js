import 'dotenv/config';
import express from "express";
import cors from "cors";
import { analyzeEmail } from "./analyzer.js";
import authRoutes from "./routes/auth.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

app.post("/api/check", async (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes("@")) {
    return res.status(400).json({ error: "Email invalide" });
  }
  try {
    const result = await analyzeEmail(email);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de l'analyse" });
  }
});

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.listen(PORT, () => {
  console.log(`ShieldMe backend running on http://localhost:${PORT}`);
});
