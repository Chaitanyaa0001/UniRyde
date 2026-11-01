import { loginSchema, registerSchema } from "./auth.schema.js";
import { registerService, loginService, logoutService, logoutAllService, } from "./auth.service.js";
import { env } from "../../config/env.config.js";
import { SESSION_TTL } from "../../utils/session.js";
import { AppError } from "../../utils/app-error.js";
export const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL * 1000,
};
// Register Controller
export const register = async (req, res) => {
    const data = registerSchema.parse(req.body);
    const { user } = await registerService(data);
    return res.status(201).json({ user });
};
// Login Controller
export const login = async (req, res) => {
    const data = loginSchema.parse(req.body);
    const { user, sessionId } = await loginService(data);
    return res
        .cookie("sid", sessionId, COOKIE_OPTIONS)
        .status(200)
        .json({ user });
};
// Logout Controller
export const logout = async (req, res) => {
    if (!req.userId || !req.sessionId) {
        throw new AppError(401, "Authentication is required");
    }
    await logoutService(req.userId, req.sessionId);
    return res.clearCookie("sid", COOKIE_OPTIONS).status(204).end();
};
// Logout All Controller
export const logoutAll = async (req, res) => {
    if (!req.userId) {
        throw new AppError(401, "Authentication is required");
    }
    await logoutAllService(req.userId);
    return res.clearCookie("sid", COOKIE_OPTIONS).status(204).end();
};
//# sourceMappingURL=auth.controller.js.map