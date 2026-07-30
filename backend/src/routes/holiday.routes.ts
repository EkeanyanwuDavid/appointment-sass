import { Router } from "express";
import {
  addHoliday,
  getHolidays,
  deleteHoliday,
} from "../controllers/holiday.controller";
import protect from "../middleware/auth.middleware";
import authorize from "../middleware/role.middleware";

const router = Router();

router.post("/", protect, authorize("business_owner"), addHoliday);
router.get("/business/:businessId", protect, getHolidays);
router.delete("/:id", protect, authorize("business_owner"), deleteHoliday);

export default router;
