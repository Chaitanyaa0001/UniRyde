import { Router } from "express";
import { authenticate } from "../../middleware/authenticate";
import {
  deleteCurrentUser,
  getCurrentUser,
  updateCurrentUser,
} from "./users.controller";

const router: Router = Router();

router.get("/me", authenticate, getCurrentUser);
router.patch("/me", authenticate, updateCurrentUser);
router.delete("/me", authenticate, deleteCurrentUser);

export default router;
