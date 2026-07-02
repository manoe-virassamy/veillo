import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import {
  findUserByEmail,
  findUserById,
  createUser,
  deleteUser,
  setResetToken,
  findUserByResetToken,
  resetPassword,
} from '../db.js';
import { sendResetEmail, sendInviteEmail } from '../email.js';

const router = Router();
export const JWT_SECRET = process.env.JWT_SECRET || 'veillo-dev-secret';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

router.post('/register', async (req, res) => {
  const { email, password, plan = 'free' } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email et mot de passe requis' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Mot de passe trop court (8 caractères minimum)' });
  }
  if (await findUserByEmail(email)) {
    return res.status(409).json({ error: 'Un compte existe déjà avec cet email' });
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await createUser({ email, password: hashed, plan });
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' });

  res.status(201).json({ token, user: { id: user.id, email: user.email, plan: user.plan } });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email et mot de passe requis' });
  }

  const user = await findUserByEmail(email);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
  }

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' });
  res.json({ token, user: { id: user.id, email: user.email, plan: user.plan } });
});

router.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Non authentifié' });
  }
  try {
    const { userId } = jwt.verify(authHeader.slice(7), JWT_SECRET);
    const user = await findUserById(userId);
    if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });
    res.json({ id: user.id, email: user.email, plan: user.plan });
  } catch {
    res.status(401).json({ error: 'Token invalide' });
  }
});

router.delete('/account', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Non authentifié' });
  }
  try {
    const { userId } = jwt.verify(authHeader.slice(7), JWT_SECRET);
    await deleteUser(userId);
    res.status(204).end();
  } catch {
    res.status(401).json({ error: 'Token invalide' });
  }
});

router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email requis' });

  const user = await findUserByEmail(email);
  if (user) {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await setResetToken(user.email, token, expiresAt);
    try {
      await sendResetEmail(user.email, `${FRONTEND_URL}/reinitialiser?token=${token}`);
    } catch (err) {
      console.error("Erreur d'envoi de l'email de réinitialisation:", err);
    }
  }
  // Réponse identique que le compte existe ou non, pour ne pas révéler quels emails sont inscrits
  res.json({ ok: true });
});

router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) return res.status(400).json({ error: 'Champs requis' });
  if (password.length < 8) return res.status(400).json({ error: 'Mot de passe trop court (8 caractères minimum)' });

  const user = await findUserByResetToken(token);
  if (!user) return res.status(400).json({ error: 'Lien invalide ou expiré' });

  const hashed = await bcrypt.hash(password, 10);
  await resetPassword(user.id, hashed);
  res.json({ ok: true });
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
  if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });

  try {
    await sendInviteEmail(email, user.email, `${FRONTEND_URL}/inscription?plan=famille`);
    res.json({ ok: true });
  } catch (err) {
    console.error("Erreur d'envoi de l'email d'invitation:", err);
    res.status(500).json({ error: "Erreur lors de l'envoi de l'invitation" });
  }
});

export default router;
