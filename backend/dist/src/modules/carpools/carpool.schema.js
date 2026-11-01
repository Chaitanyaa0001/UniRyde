import * as z from "zod";
const pointSchema = z.string().trim().min(1).max(200);
const departureTimeSchema = z.coerce.date();
export const createCarpoolSchema = z.object({
    pickupPoint: pointSchema,
    destinationPoint: pointSchema,
    departureTime: departureTimeSchema,
    requiredPeople: z.coerce.number().int().min(2).max(100),
});
export const updateCarpoolSchema = z
    .object({
    pickupPoint: pointSchema.optional(),
    destinationPoint: pointSchema.optional(),
    departureTime: departureTimeSchema.optional(),
    requiredPeople: z.coerce.number().int().min(2).max(100).optional(),
})
    .strict()
    .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
});
export const listCarpoolsSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    pickupPoint: z.string().trim().min(1).optional(),
    destinationPoint: z.string().trim().min(1).optional(),
    search: z.string().trim().min(1).optional(),
    departureDate: z.coerce.date().optional(),
    availableSeats: z.coerce.number().int().min(0).optional(),
});
export const paginationSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
});
export const requestActionSchema = z.object({
    action: z.enum(["ACCEPT", "REJECT"]),
});
//# sourceMappingURL=carpool.schema.js.map