import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { NotificationService } from '../services/NotificationService';
import { authenticate } from '../middlewares/auth.middleware';
import prisma from '../config/prisma';

const router = Router();
const notificationService = new NotificationService(prisma);
const controller = new NotificationController(notificationService);

router.use(authenticate);

router.get('/users/:userId', controller.getUserNotifications.bind(controller));
router.get('/users/:userId/unread-count', controller.getUnreadCount.bind(controller));
router.patch('/:id/read', controller.markAsRead.bind(controller));
router.patch('/users/:userId/read-all', controller.markAllAsRead.bind(controller));

export default router;