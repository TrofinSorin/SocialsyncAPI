import { Router } from 'express';
import LoginController from '../controllers/LoginController';

const router = Router();

router.post('/authentication', LoginController.loginUser);
router.post('/users/password/forgot', LoginController.forgotPassword);
router.get('/users/password/:id/:token', LoginController.getTokenValidation);
router.post('/users/reset/:id/:token', LoginController.changePassword);

export default router;
