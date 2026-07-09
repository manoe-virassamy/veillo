import { Router } from 'express';
import express from 'express';
import Stripe from 'stripe';
import jwt from 'jsonwebtoken';
import {
  findUserById,
  updateUserPlan,
  setStripeCustomer,
  findUserByStripeSubscriptionId,
} from '../db.js';
import { JWT_SECRET } from './auth.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

const PLAN_TO_PRICE = {
  pro: process.env.STRIPE_PRICE_PRO,
  famille: process.env.STRIPE_PRICE_FAMILLE,
};

const router = Router();

router.post('/create-checkout-session', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Non authentifié' });
  }
  const { plan } = req.body;
  if (!PLAN_TO_PRICE[plan]) {
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

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    ...(user.stripe_customer_id
      ? { customer: user.stripe_customer_id }
      : { customer_email: user.email }),
    line_items: [{ price: PLAN_TO_PRICE[plan], quantity: 1 }],
    // "Essayer 30 jours gratuits" est promis sur la page Tarifs pour le plan Pro
    ...(plan === 'pro' ? { subscription_data: { trial_period_days: 30 } } : {}),
    success_url: `${FRONTEND_URL}/dashboard?upgraded=1`,
    cancel_url: `${FRONTEND_URL}/tarifs`,
    client_reference_id: String(user.id),
    metadata: { userId: String(user.id), plan },
  });

  res.json({ url: session.url });
});

router.post('/create-portal-session', async (req, res) => {
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
  if (!user?.stripe_customer_id) {
    return res.status(400).json({ error: 'Aucun abonnement actif' });
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripe_customer_id,
    return_url: `${FRONTEND_URL}/dashboard`,
  });

  res.json({ url: session.url });
});

// Route séparée : nécessite le corps brut de la requête (non parsé en JSON)
// pour que Stripe puisse vérifier la signature — montée avant express.json() dans server.js.
export const webhookRouter = Router();
webhookRouter.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      req.headers['stripe-signature'],
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Signature de webhook Stripe invalide:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = Number(session.client_reference_id);
    const plan = session.metadata?.plan;
    if (userId && plan) {
      await updateUserPlan(userId, plan);
      await setStripeCustomer(userId, session.customer, session.subscription);
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object;
    const user = await findUserByStripeSubscriptionId(subscription.id);
    if (user) await updateUserPlan(user.id, 'free');
  }

  res.json({ received: true });
});

export default router;
