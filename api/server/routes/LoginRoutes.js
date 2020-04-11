import { Router } from 'express';
import LoginController from '../controllers/LoginController';

const router = Router();

router.post('/authentication', LoginController.loginUser);

export default router;
