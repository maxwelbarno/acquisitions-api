import express from 'express';
import {
  deleteUserById,
  fetchAlllUsers,
  fetchUserById,
  updateUserById,
} from '#controllers/users.controller.js';
import { authenticateToken } from '#middleware/auth.middleware.js';

const router = express.Router();

router.get('/', authenticateToken, fetchAlllUsers);
router.get('/:id', authenticateToken, fetchUserById);
router.put('/:id', authenticateToken, updateUserById);
router.delete('/:id', authenticateToken, deleteUserById);

export default router;
