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
  updateUserPlan,
  setVerifyToken,
  findUserByVerifyToken,
  markEmailVerified,
} from '../db.js';
import { sendResetEmail, sendInviteEmail, sendWelcomeEmail, sendVerificationEmail } from '../email.js';

const router = Router();
export const JWT_SECRET = process.env.JWT_SECRET || 'veillo-dev-secret';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || '').toLowerCase();

function isAdmin(email) {
  return !!ADMIN_EMAIL && email.toLowerCase() === ADMIN_EMAIL;
}

function toPublicUser(user) {
  return {
    id: user.id,
    email: user.email,
    plan: user.plan,
    firstName: user.first_name || user.email.split('@')[0],
    isAdmin: isAdmin(user.email),
    emailVerified: user.email_verified,
  };
}

async function sendVerification(user) {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await setVerifyToken(user.id, token, expiresAt);
  await sendVerificationEmail(user.email, `${FRONTEND_URL}/verifier-email?token=${token}`);
}

router.post('/register', async (req, res) => {
  const { email, password, plan = 'free', firstName } = req.body;

  if (!email || !password || !firstName) {
    return res.status(400).json({ error: 'Prénom, email et mot de passe requis' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Mot de passe trop court (8 caractères minimum)' });
  }
  if (await findUserByEmail(email)) {
    return res.status(409).json({ error: 'Un compte existe déjà avec cet email' });
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await createUser({ email, password: hashed, plan, firstName: firstName.trim() });
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' });

  try {
    await sendWelcomeEmail(user.email, user.first_name);
    await sendVerification(user);
  } catch (err) {
    console.error("Erreur d'envoi des emails d'inscription:", err);
  }

  res.status(201).json({ token, user: toPublicUser(user) });
});

router.post('/verify-email', async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: 'Token requis' });

  const user = await findUserByVerifyToken(token);
  if (!user) return res.status(400).json({ error: 'Lien invalide ou expiré' });

  await markEmailVerified(user.id);
  res.json({ ok: true });
});

router.post('/resend-verification', async (req, res) => {
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
  if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });
  if (user.email_verified) return res.status(400).json({ error: 'Email déjà confirmé' });

  try {
    await sendVerification(user);
    res.json({ ok: true });
  } catch (err) {
    console.error("Erreur d'envoi de l'email de confirmation:", err);
    res.status(500).json({ error: "Erreur lors de l'envoi de l'email" });
  }
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
  res.json({ token, user: toPublicUser(user) });
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
    res.json(toPublicUser(user));
  } catch {
    res.status(401).json({ error: 'Token invalide' });
  }
});

router.patch('/plan', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Non authentifié' });
  }
  const { plan } = req.body;
  if (!['free', 'pro', 'famille'].includes(plan)) {
    return res.status(400).json({ error: 'Plan invalide' });
  }

  let userId, user;
  try {
    ({ userId } = jwt.verify(authHeader.slice(7), JWT_SECRET));
    user = await findUserById(userId);
  } catch {
    return res.status(401).json({ error: 'Token invalide' });
  }
  if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });
  if (!isAdmin(user.email)) return res.status(403).json({ error: 'Non autorisé' });

  const updated = await updateUserPlan(userId, plan);
  res.json(toPublicUser(updated));
});

router.post('/change-password', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Non authentifié' });
  }
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Champs requis' });
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'Mot de passe trop court (8 caractères minimum)' });
  }

  let userId, user;
  try {
    ({ userId } = jwt.verify(authHeader.slice(7), JWT_SECRET));
    user = await findUserById(userId);
  } catch {
    return res.status(401).json({ error: 'Token invalide' });
  }
  if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });

  if (!(await bcrypt.compare(currentPassword, user.password))) {
    return res.status(401).json({ error: 'Mot de passe actuel incorrect' });
  }

  const hashed = await bcrypt.hash(newPassword, 10);
  await resetPassword(user.id, hashed);
  res.json({ ok: true });
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
    await sendInviteEmail(email, user.email, `${FRONTEND_URL}/inscription`);
    res.json({ ok: true });
  } catch (err) {
    console.error("Erreur d'envoi de l'email d'invitation:", err);
    res.status(500).json({ error: "Erreur lors de l'envoi de l'invitation" });
  }
});

export default router;
