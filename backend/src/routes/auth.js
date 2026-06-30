import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { findUserByEmail, findUserById, createUser } from '../db.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'veillo-dev-secret';

router.post('/register', async (req, res) => {
  const { email, password, plan = 'free' } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email et mot de passe requis' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Mot de passe trop court (8 caractères minimum)' });
  }
  if (findUserByEmail(email)) {
    return res.status(409).json({ error: 'Un compte existe déjà avec cet email' });
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = createUser({ email, password: hashed, plan });
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' });

  res.status(201).json({ token, user: { id: user.id, email: user.email, plan: user.plan } });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email et mot de passe requis' });
  }

  const user = findUserByEmail(email);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
  }

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' });
  res.json({ token, user: { id: user.id, email: user.email, plan: user.plan } });
});

router.get('/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Non authentifié' });
  }
  try {
    const { userId } = jwt.verify(authHeader.slice(7), JWT_SECRET);
    const user = findUserById(userId);
    if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });
    res.json({ id: user.id, email: user.email, plan: user.plan });
  } catch {
    res.status(401).json({ error: 'Token invalide' });
  }
});

export default router;
