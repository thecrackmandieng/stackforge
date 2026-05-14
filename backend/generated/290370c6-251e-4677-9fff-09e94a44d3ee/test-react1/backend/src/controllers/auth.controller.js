import * as service from '../services/auth.service.js';

export async function requestOtp(req, res, next) {
  try {
    res.json(await service.requestOtp(req.body.recipient));
  } catch (error) {
    next(error);
  }
}

export async function verifyOtp(req, res, next) {
  try {
    const valid = service.verifyOtp(req.body.recipient, req.body.code);
    if (!valid) {
      return res.status(401).json({ message: 'Code OTP invalide ou expire.' });
    }

    res.json({ status: true, message: 'Connexion OTP validee.' });
  } catch (error) {
    next(error);
  }
}
