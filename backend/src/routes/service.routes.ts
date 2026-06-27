import { Router } from "express";
import {
  addService,
  getServices,
  updateService,
  deleteService,
  getServicesBySlug,
} from "../controllers/service.controller";
import protect from "../middleware/auth.middleware";
import authorize from "../middleware/role.middleware";

const router = Router();

router.post("/", protect, authorize("business_owner"), addService);
router.get("/", protect, authorize("business_owner"), getServices);
router.put("/:id", protect, authorize("business_owner"), updateService);
router.delete("/:id", protect, authorize("business_owner"), deleteService);
router.get("/public/:slug", getServicesBySlug);

export default router;
