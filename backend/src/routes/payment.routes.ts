import { Router } from "express";
import {
  initializePayment,
  verifyPayment,
} from "../controllers/payment.controller";
import protect from "../middleware/auth.middleware";
import authorize from "../middleware/role.middleware";

const router = Router();

router.post("/initialize", protect, authorize("customer"), initializePayment);
router.get("/verify/:reference", protect, authorize("customer"), verifyPayment);

export default router;
