import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { saveFeedback, listFeedback, findUserById } from '../db.js';
import { JWT_SECRET, isAdmin } from './auth.js';

const router = Router();

const RATING_MIN = 1;
const RATING_MAX = 10;

router.post('/', async (req, res) => {
  const { email, rating, understanding, usefulness, message, subscribeIntent } = req.body;

  const ratingNum = Number(rating);
  if (!Number.isInteger(ratingNum) || ratingNum < RATING_MIN || ratingNum > RATING_MAX) {
    return res.status(400).json({ error: 'Note globale requise (1 à 10)' });
  }
  if (!understanding || !usefulness || !subscribeIntent) {
    return res.status(400).json({ error: 'Merci de répondre à toutes les questions' });
  }

  await saveFeedback({
    email: email || null,
    rating: ratingNum,
    understanding,
    usefulness,
    message: message?.trim() || null,
    subscribeIntent,
  });
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
