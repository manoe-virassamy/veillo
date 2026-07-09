import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');
const FROM = { email: process.env.SENDGRID_FROM_EMAIL, name: 'Veillo' };

const CREAM = '#FAF7F2';
const SAGE = '#2D4F3E';
const SAGE_LIGHT = '#4A7361';
const CORAL = '#E8836B';
const INK = '#1A1A1A';
const INK_SOFT = '#5C5650';
const LINE = '#E2DCD0';

function renderEmail({ eyebrow, title, bodyHtml, ctaText, ctaUrl }) {
  return `
  <div style="background:${CREAM};padding:48px 20px;font-family:'Inter',Arial,Helvetica,sans-serif;">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:wght@500&family=Inter:wght@400;600&display=swap">
    <div style="max-width:480px;margin:0 auto;">
      <div style="margin-bottom:36px;">
        <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${CORAL};vertical-align:middle;margin-right:8px;"></span>
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
      </div>
      <div style="text-align:center;margin-top:28px;">
        <span style="font-size:13px;color:${INK_SOFT};">Veillo — cybersécurité personnelle, sans jargon.</span>
      </div>
    </div>
  </div>
  `;
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
