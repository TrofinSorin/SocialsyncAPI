import { Router } from 'express';
import LoginController from '../controllers/LoginController';

const router = Router();

router.post('/authentication', LoginController.loginUser);
router.post('/users/password/forgot', LoginController.forgotPassword);

export default router;
