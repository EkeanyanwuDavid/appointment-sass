import { Router } from "express";
import {
  requestLeave,
  getMyLeaves,
  getLeaveBalance,
  getBusinessLeaves,
  getStaffLeaveBalances,
  updateLeaveStatus,
} from "../controllers/leave.controller";
import protect from "../middleware/auth.middleware";
import authorize from "../middleware/role.middleware";

const router = Router();

router.post("/", protect, authorize("staff"), requestLeave);
router.get("/my", protect, authorize("staff"), getMyLeaves);
router.get("/balance", protect, authorize("staff"), getLeaveBalance);
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
router.get(
  "/business/:businessId/balances",
  protect,
  authorize("business_owner"),
  getStaffLeaveBalances,
);
export default router;
