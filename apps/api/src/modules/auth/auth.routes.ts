import { Router } from 'express';
import { sendOtpController, verifyOtpController, refreshController } from './auth.controller';

const router = Router();

router.post('/send-otp', sendOtpController);
router.post('/verify-otp', verifyOtpController);
router.post('/refresh', refreshController);

export default router;
