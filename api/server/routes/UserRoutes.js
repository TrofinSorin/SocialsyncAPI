import { Router } from 'express';
import UserController from '../controllers/UserController';
import LoginController from '../controllers/LoginController';

const router = Router();

router.get('/', UserController.getAllUsers);
router.post('/', UserController.addUser);
router.put('/:id', UserController.updatedUser);
router.delete('/:id', UserController.deleteUser);
router.post('/authentication', LoginController.loginUser);

export default router;
