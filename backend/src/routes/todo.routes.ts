import { Router } from "express";
import { TodoController } from "../controllers/todo.controller";
import { container } from "../container";
import { authenticate } from "../middlewares/auth.middleware";
import { validateId, validateStatus, validateAssignment } from "../middlewares/validation.middleware";
import { upload } from "../middlewares/upload";
import multer from "multer";

const router = Router();
const controller = new TodoController(container.getTodoService());

router.post("/", controller.create);
router.post("/with-image", upload.single("image"), controller.createWithImage);
router.post("/with-audio", upload.single("audio"), controller.createWithAudio);
router.post("/with-media", upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'audio', maxCount: 1 }
]), controller.createWithMedia);

router.use(authenticate);

router.get("/:id", validateId, controller.getById);
router.put("/:id", validateId, controller.update);
router.patch("/:id", validateId, controller.updatePartial);
router.patch("/:id/toggle-complete", validateId, validateStatus, controller.toggleComplete);
router.patch("/:id/delegate", validateId, validateAssignment, controller.delegate);
router.patch("/:id/audio", validateId, controller.updateAudio);
router.patch("/:id/image", validateId, controller.updateImage);
router.delete("/:id", validateId, controller.remove);

router.get("/", controller.getAll);

export default router;
