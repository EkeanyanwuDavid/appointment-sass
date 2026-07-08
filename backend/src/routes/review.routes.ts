import { Router } from "express";
import {
  createReview,
  getBusinessReviews,
  getStaffReviews,
} from "../controllers/review.controller";
import protect from "../middleware/auth.middleware";
import authorize from "../middleware/role.middleware";

const router = Router();

router.post("/", protect, authorize("customer"), createReview);
router.get("/business/:businessId", getBusinessReviews); // public
router.get(
  "/staff/:staffId",
  protect,
  authorize("business_owner", "staff"),
  getStaffReviews,
);

export default router;
