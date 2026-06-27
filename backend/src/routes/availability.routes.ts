import { Router } from "express";
import {
  setAvailability,
  getAvailability,
} from "../controllers/availability.controller";
import protect from "../middleware/auth.middleware";
import authorize from "../middleware/role.middleware";

const router = Router();

router.post("/", protect, authorize("business_owner"), setAvailability);
router.get("/:staffId", getAvailability);

export default router;
