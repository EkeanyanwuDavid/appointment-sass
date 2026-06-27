import { Router } from "express";
import {
  addStaff,
  getStaff,
  removeStaff,
} from "../controllers/staff.controller";
import protect from "../middleware/auth.middleware";
import authorize from "../middleware/role.middleware";

const router = Router();

router.post("/", protect, authorize("business_owner"), addStaff);
router.get("/", protect, authorize("business_owner"), getStaff);
router.delete("/:id", protect, authorize("business_owner"), removeStaff);

export default router;
