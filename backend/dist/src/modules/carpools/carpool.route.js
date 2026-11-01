import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { cancelCarpool, createCarpool, createJoinRequest, getCarpoolDetails, listCarpools, listIncomingRequests, listMyCreatedCarpools, listMyJoinedCarpools, listMyRequests, updateCarpool, updateJoinRequest, } from "./carpool.controller.js";
const router = Router();
// All carpool routes require an authenticated user.
router.use(authenticate);
router.get("/", listCarpools);
router.get("/me/created", listMyCreatedCarpools);
router.get("/me/joined", listMyJoinedCarpools);
router.get("/me/requests", listMyRequests);
router.get("/:id", getCarpoolDetails);
router.post("/", createCarpool);
router.patch("/:id", updateCarpool);
router.patch("/:id/cancel", cancelCarpool);
router.post("/:id/requests", createJoinRequest);
router.get("/:id/requests", listIncomingRequests);
router.patch("/:id/requests/:requestId", updateJoinRequest);
export default router;
//# sourceMappingURL=carpool.route.js.map