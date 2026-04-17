import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../../middleware/validate.middleware';
import { authenticate } from '../../middleware/auth.middleware';
import { createChat, getChatHistory, deleteChat } from './chat.controller';

const router = Router();

// Secure all chat routes
router.use(authenticate);

const createChatSchema = z.object({
  body: z.object({
    message: z.string().min(1),
  }),
});

router.post('/', validate(createChatSchema), createChat);
router.get('/history', getChatHistory);
router.delete('/:id', deleteChat);

export default router;
