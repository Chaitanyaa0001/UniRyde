import { AppError } from "../../utils/app-error.js";
import { messageListSchema } from "./chat.schema.js";
import * as service from "./chat.service.js";
const userIdOrThrow = (req) => {
    if (!req.userId)
        throw new AppError(401, "Authentication is required");
    return req.userId;
};
export const listConversations = async (req, res) => {
    const conversations = await service.listConversationsService(userIdOrThrow(req));
    return res.status(200).json({ conversations });
};
export const listMessages = async (req, res) => {
    if (typeof req.params.id !== "string") {
        throw new AppError(400, "Conversation id is required");
    }
    const query = messageListSchema.parse(req.query);
    const result = await service.listMessagesService(req.params.id, userIdOrThrow(req), query.cursor, query.limit);
    return res.status(200).json(result);
};
//# sourceMappingURL=chat.controller.js.map