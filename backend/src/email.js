import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');
const FROM = { email: process.env.SENDGRID_FROM_EMAIL, name: 'Veillo' };

const CREAM = '#FAF7F2';
const SAGE = '#2D4F3E';
const SAGE_LIGHT = '#4A7361';
const INK = '#1A1A1A';
const INK_SOFT = '#5C5650';
const LINE = '#E2DCD0';
const LOGO_URL = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/favicon.png`;

function renderEmail({ eyebrow, title, bodyHtml, ctaText, ctaUrl, afterCta }) {
  return `
  <div style="background:${CREAM};padding:48px 20px;font-family:'Inter',Arial,Helvetica,sans-serif;">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:wght@500&family=Inter:wght@400;600&display=swap">
    <div style="max-width:480px;margin:0 auto;">
      <div style="margin-bottom:36px;">
        <img src="${LOGO_URL}" alt="Veillo" width="28" height="28" style="border-radius:6px;vertical-align:middle;margin-right:10px;">
        <span style="font-family:'Fraunces',Georgia,serif;font-size:20px;font-weight:600;color:${INK};letter-spacing:-0.02em;vertical-align:middle;">Veillo</span>
      </div>
      <div style="background:#ffffff;border:1.5px solid ${LINE};border-radius:24px;padding:40px 36px;">
        ${eyebrow ? `<div style="font-size:12px;font-weight:600;color:${SAGE_LIGHT};text-transform:uppercase;letter-spacing:0.1em;margin-bottom:16px;">${eyebrow}</div>` : ''}
        <h1 style="font-family:'Fraunces',Georgia,serif;font-size:26px;font-weight:500;color:${INK};margin:0 0 18px;letter-spacing:-0.01em;">${title}</h1>
        <div style="font-size:15px;line-height:1.65;color:${INK_SOFT};">${bodyHtml}</div>
        ${ctaUrl ? `
        <div style="margin-top:28px;">
          <a href="${ctaUrl}" style="display:inline-block;background:${SAGE};color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:100px;font-weight:600;font-size:14px;font-family:'Inter',Arial,sans-serif;">${ctaText} →</a>
        </div>` : ''}
        ${afterCta ? `<div style="margin-top:24px;font-size:14px;line-height:1.65;color:${INK_SOFT};">${afterCta}</div>` : ''}
      </div>
      <div style="text-align:center;margin-top:28px;">
        <span style="font-size:13px;color:${INK_SOFT};">Veillo — cybersécurité personnelle, sans jargon.</span>
      </div>
    </div>
  </div>
  `;
}

function greeting(firstName) {
  return firstName ? `Bonjour ${firstName},` : 'Bonjour,';
}

export async function sendResetEmail(to, resetUrl) {
  await sgMail.send({
    to,
    from: FROM,
    subject: 'Réinitialise ton mot de passe Veillo',
    html: renderEmail({
      eyebrow: 'Sécurité de ton compte',
      title: 'Réinitialise ton mot de passe',
      bodyHtml: `
        <p style="margin:0 0 12px;">Tu as demandé à réinitialiser ton mot de passe Veillo.</p>
        <p style="margin:0;">Ce lien expire dans 1 heure. Si tu n'es pas à l'origine de cette demande, ignore cet email.</p>
      `,
      ctaText: 'Choisir un nouveau mot de passe',
      ctaUrl: resetUrl,
    }),
  });
}

export async function sendWelcomeEmail(to, firstName) {
  await sgMail.send({
    to,
    from: FROM,
    subject: 'Bienvenue sur Veillo',
    html: renderEmail({
      eyebrow: 'Bienvenue',
      title: `Bienvenue sur Veillo, ${firstName}`,
      bodyHtml: `
        <p style="margin:0 0 12px;">Ton compte est créé. Tu peux dès maintenant vérifier si tes emails sont apparus dans des fuites de données connues, et suivre ton score de vulnérabilité.</p>
        <p style="margin:0;">Pense à confirmer ton adresse email — tu as reçu un second email pour ça juste après celui-ci.</p>
      `,
      ctaText: 'Aller sur mon tableau de bord',
      ctaUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard`,
    }),
  });
}

export async function sendVerificationEmail(to, verifyUrl) {
  await sgMail.send({
    to,
    from: FROM,
    subject: 'Confirme ton adresse email Veillo',
    html: renderEmail({
      eyebrow: 'Confirmation d\'email',
      title: 'Confirme ton adresse email',
      bodyHtml: `
        <p style="margin:0 0 12px;">Pour activer pleinement ton compte Veillo, confirme que cette adresse t'appartient bien.</p>
        <p style="margin:0;">Ce lien expire dans 24 heures.</p>
      `,
      ctaText: 'Confirmer mon email',
      ctaUrl: verifyUrl,
    }),
  });
}

export async function sendWaitlistWelcomeEmail(to, firstName, unsubToken) {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const siteHost = frontendUrl.replace(/^https?:\/\//, '');
  await sgMail.send({
    to,
    from: FROM,
    subject: 'Ta demande d\'accès à Veillo',
    html: renderEmail({
      eyebrow: "Liste d'attente",
      title: 'Merci pour ta demande',
      bodyHtml: `
        <p style="margin:0 0 12px;">${greeting(firstName)}</p>
        <p style="margin:0 0 12px;">Merci pour ton intérêt pour Veillo.</p>
        <p style="margin:0 0 12px;">Les 50 places automatiques de notre bêta sont pour l'instant complètes. Ta demande a bien été enregistrée — je l'examinerai personnellement et t'enverrai un accès si une place se libère.</p>
        <p style="margin:0 0 20px;">À très bientôt,</p>
        <p style="margin:0;">Manoé<br>Fondateur de Veillo</p>
      `,
      afterCta: `
        <p style="margin:0;font-size:12px;">Tu reçois cet email car tu t'es inscrit(e) sur ${siteHost}. <a href="${frontendUrl}/desinscription?token=${unsubToken}" style="color:${INK_SOFT};">Se désinscrire</a></p>
      `,
    }),
  });
}

export async function sendBetaInviteEmail(to, firstName, inviteToken) {
  await sgMail.send({
    to,
    from: FROM,
    subject: 'Tu es invité(e) à tester Veillo',
    html: renderEmail({
      eyebrow: 'Invitation bêta',
      title: 'Ton accès à la bêta est activé',
      bodyHtml: `
        <p style="margin:0 0 12px;">${greeting(firstName)}</p>
        <p style="margin:0 0 12px;">Tu fais partie des 50 premières personnes à rejoindre la bêta de Veillo. Ton accès est activé.</p>
        <p style="margin:0 0 4px;"><strong>Veillo, c'est quoi ?</strong></p>
        <p style="margin:0;">Une app qui vérifie si tes données personnelles ont fuité sur internet et te dit exactement quoi faire.</p>
      `,
      ctaText: 'Créer mon compte',
      ctaUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/inscription?invite=${inviteToken}`,
      afterCta: `
        <p style="margin:0 0 12px;">Une fois connecté, n'hésite pas à nous laisser ton avis via le bouton "Donner un avis" en bas de l'app — ça nous aide énormément.</p>
        <p style="margin:0 0 20px;">100% gratuit, aucune carte bancaire requise.</p>
        <p style="margin:0;">Merci de nous faire confiance,<br>Manoé<br>Fondateur de Veillo</p>
      `,
    }),
  });
}

export async function sendInviteEmail(to, fromEmail, inviteUrl) {
  await sgMail.send({
    to,
    from: FROM,
    subject: `${fromEmail} t'invite à rejoindre Veillo`,
    html: renderEmail({
      eyebrow: 'Invitation',
      title: `${fromEmail} t'invite sur Veillo`,
      bodyHtml: `<p style="margin:0;">${fromEmail} utilise Veillo pour surveiller ses données personnelles et t'invite à faire pareil.</p>`,
      ctaText: 'Créer mon compte gratuit',
      ctaUrl: inviteUrl,
    }),
  });
}
