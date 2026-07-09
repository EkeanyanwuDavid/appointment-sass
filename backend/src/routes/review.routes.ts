import { Router } from "express";
import {
  createReview,
  getMyReviews,
  getBusinessReviews,
  getStaffReviews,
  getMyStaffReviews,
} from "../controllers/review.controller";
import protect from "../middleware/auth.middleware";
import authorize from "../middleware/role.middleware";

const router = Router();

router.post("/", protect, authorize("customer"), createReview);
router.get("/my", protect, authorize("customer"), getMyReviews);
router.get("/business/:businessId", getBusinessReviews);
router.get("/staff/my", protect, authorize("staff"), getMyStaffReviews);
router.get(
  "/staff/:staffId",
  protect,
  authorize("business_owner", "staff"),
  getStaffReviews,
);

export default router;
