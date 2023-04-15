import { Router } from 'express';
import { authUser, resetPass, createTokens } from '../controllers/main.js';

const router = Router();

router.post('/login', authUser);
router.post('/reset', resetPass);
router.post('/token', createTokens);

export default router;
