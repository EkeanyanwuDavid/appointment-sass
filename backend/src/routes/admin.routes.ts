import { Router } from "express";
import {
  getPlatformStats,
  getAllBusinessesAdmin,
  toggleBusinessStatus,
  getAllUsersAdmin,
} from "../controllers/admin.controller";
import protect from "../middleware/auth.middleware";
import authorize from "../middleware/role.middleware";

const router = Router();

router.get("/stats", protect, authorize("admin"), getPlatformStats);
router.get("/businesses", protect, authorize("admin"), getAllBusinessesAdmin);
router.put(
  "/businesses/:id/toggle",
  protect,
  authorize("admin"),
  toggleBusinessStatus,
);
router.get("/users", protect, authorize("admin"), getAllUsersAdmin);

export default router;
