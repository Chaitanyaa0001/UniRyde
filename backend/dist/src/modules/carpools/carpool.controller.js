import { AppError } from "../../utils/app-error.js";
import { createCarpoolSchema, listCarpoolsSchema, paginationSchema, requestActionSchema, updateCarpoolSchema, } from "./carpool.schema.js";
import * as service from "./carpool.service.js";
const userIdOrThrow = (req) => {
    if (!req.userId)
        throw new AppError(401, "Authentication is required");
    return req.userId;
};
const paramOrThrow = (value, name) => {
    if (typeof value !== "string" || !value) {
        throw new AppError(400, `${name} is required`);
    }
    return value;
};
export const createCarpool = async (req, res) => {
    const carpool = await service.createCarpoolService(userIdOrThrow(req), createCarpoolSchema.parse(req.body));
    return res.status(201).json({ carpool });
};
export const listCarpools = async (req, res) => {
    const result = await service.listCarpoolsService(userIdOrThrow(req), listCarpoolsSchema.parse(req.query));
    return res.status(200).json(result);
};
export const getCarpoolDetails = async (req, res) => {
    const carpool = await service.getCarpoolDetailsService(paramOrThrow(req.params.id, "Carpool id"), userIdOrThrow(req));
    return res.status(200).json({ carpool });
};
export const updateCarpool = async (req, res) => {
    const carpool = await service.updateCarpoolService(paramOrThrow(req.params.id, "Carpool id"), userIdOrThrow(req), updateCarpoolSchema.parse(req.body));
    return res.status(200).json({ carpool });
};
export const cancelCarpool = async (req, res) => {
    const carpool = await service.cancelCarpoolService(paramOrThrow(req.params.id, "Carpool id"), userIdOrThrow(req));
    return res.status(200).json({ carpool });
};
export const createJoinRequest = async (req, res) => {
    const request = await service.createJoinRequestService(paramOrThrow(req.params.id, "Carpool id"), userIdOrThrow(req));
    return res.status(201).json({ request });
};
export const listIncomingRequests = async (req, res) => {
    const result = await service.listIncomingRequestsService(paramOrThrow(req.params.id, "Carpool id"), userIdOrThrow(req), paginationSchema.parse(req.query));
    return res.status(200).json(result);
};
export const updateJoinRequest = async (req, res) => {
    const result = await service.updateJoinRequestService(paramOrThrow(req.params.id, "Carpool id"), paramOrThrow(req.params.requestId, "Request id"), userIdOrThrow(req), requestActionSchema.parse(req.body));
    return res.status(200).json(result);
};
export const listMyCreatedCarpools = async (req, res) => {
    const carpools = await service.listMyCreatedCarpoolsService(userIdOrThrow(req));
    return res.status(200).json({ carpools });
};
export const listMyJoinedCarpools = async (req, res) => {
    const carpools = await service.listMyJoinedCarpoolsService(userIdOrThrow(req));
    return res.status(200).json({ carpools });
};
export const listMyRequests = async (req, res) => {
    const requests = await service.listMyRequestsService(userIdOrThrow(req));
    return res.status(200).json({ requests });
};
//# sourceMappingURL=carpool.controller.js.map