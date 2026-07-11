import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { saveFeedback, listFeedback, findUserById } from '../db.js';
import { JWT_SECRET, isAdmin } from './auth.js';

const router = Router();

router.post('/', async (req, res) => {
  const { email, message } = req.body;
  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Message requis' });
  }

  await saveFeedback({ email: email || null, message: message.trim() });
  res.status(201).json({ ok: true });
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

  res.json(await listFeedback());
});

export default router;
