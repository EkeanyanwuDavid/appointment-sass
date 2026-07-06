import { Router } from "express";
import {
  createBooking,
  getMyBookings,
  getBusinessBookings,
  getStaffBookings,
  updateBookingStatus,
  markBookingComplete,
  cancelBooking,
  getSlots,
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
router.get("/slots", getSlots);
router.get("/staff/my", protect, authorize("staff"), getStaffBookings);
router.put(
  "/:id/status",
  protect,
  authorize("business_owner"),
  updateBookingStatus,
);
router.put("/:id/cancel", protect, authorize("customer"), cancelBooking);

router.put("/:id/complete", protect, authorize("staff"), markBookingComplete);
export default router;
