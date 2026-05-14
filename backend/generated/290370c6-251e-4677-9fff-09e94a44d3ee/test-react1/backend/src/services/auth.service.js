import nodemailer from 'nodemailer';

const otps = new Map();
const OTP_TTL_MS = 5 * 60 * 1000;

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function normalizeRecipient(recipient) {
  return String(recipient || '').trim().toLowerCase();
}

function detectChannel(recipient) {
  return recipient.includes('@') ? 'email' : 'sms';
}

function storeCode(recipient, code) {
  otps.set(recipient, {
    code,
    expiresAt: Date.now() + OTP_TTL_MS
  });
}

async function sendEmail(recipient, code) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    return false;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    }
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: recipient,
    subject: 'Votre code OTP',
    text: `Votre code OTP est ${code}. Il expire dans 5 minutes.`
  });

  return true;
}

async function sendSms(recipient, code) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM;

  if (!sid || !token || !from) {
    return false;
  }

  const body = new URLSearchParams({
    To: recipient,
    From: from,
    Body: `Votre code OTP est ${code}. Il expire dans 5 minutes.`
  });

  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body
  });

  if (!response.ok) {
    throw new Error('Envoi SMS impossible.');
  }

  return true;
}

export async function requestOtp(rawRecipient) {
  const recipient = normalizeRecipient(rawRecipient);

  if (!recipient) {
    throw new Error('Email ou telephone obligatoire.');
  }

  const code = generateCode();
  const channel = detectChannel(recipient);
  storeCode(recipient, code);

  const sent = channel === 'email' ? await sendEmail(recipient, code) : await sendSms(recipient, code);

  if (!sent) {
    console.log(`[DEV OTP] ${recipient}: ${code}`);
  }

  return {
    sent,
    channel,
    message: sent
      ? `Code OTP envoye par ${channel === 'email' ? 'email' : 'SMS'}.`
      : 'Mode developpement: fournisseur OTP non configure, code affiche dans les logs backend.'
  };
}

export function verifyOtp(rawRecipient, code) {
  const recipient = normalizeRecipient(rawRecipient);
  const entry = otps.get(recipient);

  if (!entry || Date.now() > entry.expiresAt) {
    otps.delete(recipient);
    return false;
  }

  const valid = entry.code === String(code || '').trim();
  if (valid) {
    otps.delete(recipient);
  }

  return valid;
}
