import { Router } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { addToWaitlist, listWaitlist, setWaitlistInviteToken, findWaitlistByInviteToken, findUserById } from '../db.js';
import { sendWaitlistWelcomeEmail, sendBetaInviteEmail } from '../email.js';
import { JWT_SECRET, isAdmin } from './auth.js';

const router = Router();

router.post('/join', async (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Email invalide' });
  }

  const entry = await addToWaitlist(email);
  if (entry) {
    try {
      await sendWaitlistWelcomeEmail(entry.email);
    } catch (err) {
      console.error("Erreur d'envoi de l'email de bienvenue liste d'attente:", err);
    }
  }
  // Réponse identique que l'email soit déjà inscrit ou non
  res.json({ ok: true });
});

// Public : la page d'inscription l'utilise pour vérifier le lien d'invitation et pré-remplir l'email.
router.get('/invite/:token', async (req, res) => {
  const invite = await findWaitlistByInviteToken(req.params.token);
  if (!invite) return res.status(404).json({ error: 'Invitation invalide ou expirée' });
  res.json({ email: invite.email });
});

router.get('/', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Non authentifié' });
  }
  let userId, user;
  try {
    ({ userId } = jwt.verify(authHeader.slice(7), JWT_SECRET));
    user = await findUserById(userId);
  } catch {
    return res.status(401).json({ error: 'Token invalide' });
  }
  if (!user || !isAdmin(user.email)) return res.status(403).json({ error: 'Non autorisé' });

  res.json(await listWaitlist());
});

router.post('/invite', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Non authentifié' });
  }
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email requis' });

  let userId, user;
  try {
    ({ userId } = jwt.verify(authHeader.slice(7), JWT_SECRET));
    user = await findUserById(userId);
  } catch {
    return res.status(401).json({ error: 'Token invalide' });
  }
  if (!user || !isAdmin(user.email)) return res.status(403).json({ error: 'Non autorisé' });

  try {
    const token = crypto.randomBytes(24).toString('hex');
    await setWaitlistInviteToken(email, token);
    await sendBetaInviteEmail(email, token);
    res.json({ ok: true });
  } catch (err) {
    console.error("Erreur d'envoi de l'invitation bêta:", err);
    res.status(500).json({ error: "Erreur lors de l'envoi de l'invitation" });
  }
});

export default router;
