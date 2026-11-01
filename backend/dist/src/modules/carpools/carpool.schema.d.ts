import * as z from "zod";
export declare const createCarpoolSchema: z.ZodObject<{
    pickupPoint: z.ZodString;
    destinationPoint: z.ZodString;
    departureTime: z.ZodCoercedDate<unknown>;
    requiredPeople: z.ZodCoercedNumber<unknown>;
}, z.core.$strip>;
export declare const updateCarpoolSchema: z.ZodObject<{
    pickupPoint: z.ZodOptional<z.ZodString>;
    destinationPoint: z.ZodOptional<z.ZodString>;
    departureTime: z.ZodOptional<z.ZodCoercedDate<unknown>>;
    requiredPeople: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
}, z.core.$strict>;
export declare const listCarpoolsSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    pickupPoint: z.ZodOptional<z.ZodString>;
    destinationPoint: z.ZodOptional<z.ZodString>;
    search: z.ZodOptional<z.ZodString>;
    departureDate: z.ZodOptional<z.ZodCoercedDate<unknown>>;
    availableSeats: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
export declare const paginationSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
export declare const requestActionSchema: z.ZodObject<{
    action: z.ZodEnum<{
        ACCEPT: "ACCEPT";
        REJECT: "REJECT";
    }>;
}, z.core.$strip>;
export type CreateCarpoolInput = z.infer<typeof createCarpoolSchema>;
export type UpdateCarpoolInput = z.infer<typeof updateCarpoolSchema>;
export type ListCarpoolsInput = z.infer<typeof listCarpoolsSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type RequestActionInput = z.infer<typeof requestActionSchema>;
export type AcceptRequestInput = {
    action: "ACCEPT";
};
export type RejectRequestInput = {
    action: "REJECT";
};
//# sourceMappingURL=carpool.schema.d.ts.map