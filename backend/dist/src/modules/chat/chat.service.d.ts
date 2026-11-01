import type { SendMessageInput } from "./chat.schema.js";
export declare const createMessageService: (userId: string, data: SendMessageInput) => Promise<any>;
export declare const listConversationsService: (userId: string) => Promise<any>;
export declare const listMessagesService: (conversationId: string, userId: string, cursor: string | undefined, limit: number) => Promise<{
    messages: any;
    nextCursor: any;
}>;
//# sourceMappingURL=chat.service.d.ts.map