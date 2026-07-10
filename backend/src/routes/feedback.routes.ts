import { Router } from "express";
import { body } from "express-validator";
import {
  createFeedback,
  getFeedback,
  updateFeedbackStatus,
} from "../controllers/feedback.controller";
import protect from "../middleware/auth.middleware";
import authorize from "../middleware/role.middleware";

const router = Router();

router.post(
  "/",
  [
    body("name").notEmpty().trim(),
    body("email").isEmail(),
    body("category").notEmpty(),
    body("message").isLength({ min: 10 }),
  ],
  createFeedback,
);

router.get("/", protect, authorize("admin"), getFeedback);

router.put("/:id/status", protect, authorize("admin"), updateFeedbackStatus);

export default router;
