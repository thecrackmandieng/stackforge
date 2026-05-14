import { Router } from 'express';
import * as controller from '../controllers/auth.controller.js';

const router = Router();

router.post('/request-otp', controller.requestOtp);
router.post('/verify-otp', controller.verifyOtp);

export default router;
