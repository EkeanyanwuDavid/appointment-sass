import { Router } from "express";
import {
  createBooking,
  getMyBookings,
  getBusinessBookings,
  getStaffBookings,
  updateBookingStatus,
  cancelBooking,
} from "../controllers/booking.controller";
import protect from "../middleware/auth.middleware";
import authorize from "../middleware/role.middleware";

const router = Router();

router.post("/", protect, authorize("customer"), createBooking);
router.get("/my", protect, authorize("customer"), getMyBookings);
router.get(
  "/business/:businessId",
  protect,
  authorize("business_owner"),
  getBusinessBookings,
);
router.get(
  "/staff/:staffId",
  protect,
  authorize("staff", "business_owner"),
  getStaffBookings,
);
router.put(
  "/:id/status",
  protect,
  authorize("business_owner"),
  updateBookingStatus,
);
router.put("/:id/cancel", protect, authorize("customer"), cancelBooking);

export default router;
