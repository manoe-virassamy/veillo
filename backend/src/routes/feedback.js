import { Router } from 'express';
import { saveFeedback } from '../db.js';

const router = Router();

router.post('/', async (req, res) => {
  const { email, message } = req.body;
  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Message requis' });
  }

  await saveFeedback({ email: email || null, message: message.trim() });
  res.status(201).json({ ok: true });
});

export default router;
