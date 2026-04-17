import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../../middleware/validate.middleware';
import { authenticate } from '../../middleware/auth.middleware';
import { getProfile, updateProfile, getStats } from './user.controller';

const router = Router();

// Secure all user routes
router.use(authenticate);

const updateProfileSchema = z.object({
  body: z.object({
    weight_kg: z.number().positive().optional(),
    height_cm: z.number().positive().optional(),
    age: z.number().positive().optional(),
    goal: z.enum(['weight_loss', 'maintenance', 'weight_gain']).optional(),
    activity_level: z.enum(['sedentary', 'moderate', 'active']).optional(),
  }),
});

router.get('/profile', getProfile);
router.put('/profile', validate(updateProfileSchema), updateProfile);
router.get('/stats', getStats);

export default router;
