import { Router } from 'express';
import MessageController from '../controllers/MessageController';

const router = Router();

router.get('/:id', MessageController.getMessagesByUser);
router.post('/', MessageController.addMesage);
router.put('/:id', MessageController.updateMessage);
router.delete('/:id', MessageController.deleteMessage);

export default router;
