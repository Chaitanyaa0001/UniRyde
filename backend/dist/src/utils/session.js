import crypto from "node:crypto";
import { redis } from "../lib/redis.js";
export const SESSION_TTL = 60 * 60 * 24 * 15; // 15 days
export const generateSessionId = () => {
    return crypto.randomBytes(32).toString("base64url");
};
export const hashSessionId = (sessionId) => {
    return crypto.createHash("sha256").update(sessionId).digest("hex");
};
export const getUserIdFromSession = async (sessionId) => {
    const sessionHash = hashSessionId(sessionId);
    return redis.get(`session:${sessionHash}`);
};
export const createSession = async (userId) => {
    const sessionId = generateSessionId();
    const sessionHash = hashSessionId(sessionId);
    await redis
        .multi()
        .set(`session:${sessionHash}`, userId, {
        EX: SESSION_TTL,
    })
        .sAdd(`user_sessions:${userId}`, sessionHash)
        .exec();
    return sessionId;
};
export const deleteSession = async (userId, sessionId) => {
    const sessionHash = hashSessionId(sessionId);
    await redis
        .multi()
        .del(`session:${sessionHash}`)
        .sRem(`user_sessions:${userId}`, sessionHash)
        .exec();
};
export const deleteAllSessions = async (userId) => {
    const sessionHashes = await redis.sMembers(`user_sessions:${userId}`);
    const pipeline = redis.multi();
    for (const sessionHash of sessionHashes) {
        pipeline.del(`session:${sessionHash}`);
    }
    pipeline.del(`user_sessions:${userId}`);
    await pipeline.exec();
};
//# sourceMappingURL=session.js.map