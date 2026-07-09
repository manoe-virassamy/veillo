import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');
const FROM = { email: process.env.SENDGRID_FROM_EMAIL, name: 'Veillo' };

function renderEmail({ title, bodyHtml, ctaText, ctaUrl }) {
  return `
  <div style="background:#FAF7F2;padding:40px 20px;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #E5E0D8;">
      <div style="background:#2D4F3E;padding:24px 32px;">
        <span style="color:#ffffff;font-size:20px;font-weight:600;letter-spacing:-0.02em;">Veillo</span>
      </div>
      <div style="padding:32px;">
        <h1 style="font-size:20px;font-weight:600;color:#1A1A1A;margin:0 0 16px;">${title}</h1>
        <div style="font-size:15px;line-height:1.6;color:#4A4A4A;">${bodyHtml}</div>
        ${ctaUrl ? `
        <div style="margin-top:28px;">
          <a href="${ctaUrl}" style="display:inline-block;background:#2D4F3E;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:100px;font-weight:600;font-size:14px;">${ctaText} →</a>
        </div>` : ''}
      </div>
      <div style="padding:20px 32px;border-top:1px solid #E5E0D8;">
        <span style="font-size:12px;color:#9A9A9A;">Veillo — cybersécurité personnelle, sans jargon.</span>
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
      title: `${fromEmail} t'invite sur Veillo`,
      bodyHtml: `<p style="margin:0;">${fromEmail} utilise Veillo pour surveiller ses données personnelles et t'invite à faire pareil.</p>`,
      ctaText: 'Créer mon compte gratuit',
      ctaUrl: inviteUrl,
    }),
  });
}
