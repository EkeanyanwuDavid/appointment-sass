import { Router } from "express";

import {
  createBusiness,
  getMyBusiness,
  updateBusiness,
  getAllBusinesses,
  getBusinessBySlug,
} from "../controllers/business.controller";

import protect from "../middleware/auth.middleware";
import authorize from "../middleware/role.middleware";

const router = Router();

router.post("/", protect, authorize("business_owner"), createBusiness);
router.get("/me", protect, authorize("business_owner"), getMyBusiness);
router.put("/me", protect, authorize("business_owner"), updateBusiness);
router.get("/public", getAllBusinesses);
router.get("/:slug", getBusinessBySlug);

export default router;
