import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { upload } from '../middlewares/upload';

const router = Router();
const controller = new UserController();

router.use(authenticate);

router.get('/', controller.getAll.bind(controller));
router.patch('/:id/profile-image', upload.single('image'), controller.updateProfileImage.bind(controller));

export default router;
