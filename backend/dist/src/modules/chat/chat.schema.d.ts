import * as z from "zod";
export declare const sendMessageSchema: z.ZodObject<{
    conversationId: z.ZodString;
    content: z.ZodString;
}, z.core.$strip>;
export declare const conversationIdSchema: z.ZodObject<{
    conversationId: z.ZodString;
}, z.core.$strip>;
export declare const messageListSchema: z.ZodObject<{
    cursor: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
//# sourceMappingURL=chat.schema.d.ts.map