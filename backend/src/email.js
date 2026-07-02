import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');
const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL;

export async function sendResetEmail(to, resetUrl) {
  await sgMail.send({
    to,
    from: FROM_EMAIL,
    subject: 'Réinitialise ton mot de passe Veillo',
    html: `
      <p>Tu as demandé à réinitialiser ton mot de passe Veillo.</p>
      <p><a href="${resetUrl}">Clique ici pour choisir un nouveau mot de passe</a></p>
      <p>Ce lien expire dans 1 heure. Si tu n'es pas à l'origine de cette demande, ignore cet email.</p>
    `,
  });
}

export async function sendInviteEmail(to, fromEmail, inviteUrl) {
  await sgMail.send({
    to,
    from: FROM_EMAIL,
    subject: `${fromEmail} t'invite à rejoindre Veillo`,
    html: `
      <p>${fromEmail} utilise Veillo pour surveiller ses données personnelles et t'invite à faire pareil.</p>
      <p><a href="${inviteUrl}">Crée ton compte gratuit</a></p>
    `,
  });
}
