import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { listConversations, listMessages } from "./chat.controller.js";
const router = Router();
router.use(authenticate);
router.get("/conversations", listConversations);
router.get("/conversations/:id/messages", listMessages);
export default router;
//# sourceMappingURL=chat.route.js.map