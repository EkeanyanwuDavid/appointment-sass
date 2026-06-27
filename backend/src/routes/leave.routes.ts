import { Router } from "express";
import {
  requestLeave,
  getMyLeaves,
  getBusinessLeaves,
  updateLeaveStatus,
} from "../controllers/leave.controller";
import protect from "../middleware/auth.middleware";
import authorize from "../middleware/role.middleware";

const router = Router();

router.post("/", protect, authorize("staff"), requestLeave);
router.get("/my", protect, authorize("staff"), getMyLeaves);
router.get(
  "/business/:businessId",
  protect,
  authorize("business_owner"),
  getBusinessLeaves,
);
router.put(
  "/:id/status",
  protect,
  authorize("business_owner"),
  updateLeaveStatus,
);

export default router;
