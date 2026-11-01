import { getUserIdFromSession } from "../utils/session.js";
import { AppError } from "../utils/app-error.js";
export const authenticate = async (req, _res, next) => {
    const sessionId = req.cookies?.sid;
    if (typeof sessionId !== "string" || !sessionId) {
        throw new AppError(401, "Authentication is required");
    }
    const userId = await getUserIdFromSession(sessionId);
    if (!userId) {
        throw new AppError(401, "Invalid or expired session");
    }
    req.userId = userId;
    req.sessionId = sessionId;
    next();
};
//# sourceMappingURL=authenticate.js.map