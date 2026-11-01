import type { Request, Response } from "express";
import { AppError } from "../../utils/app-error.js";
import {
  createCarpoolSchema,
  listCarpoolsSchema,
  paginationSchema,
  requestActionSchema,
  updateCarpoolSchema,
} from "./carpool.schema.js";
import * as service from "./carpool.service.js";

const userIdOrThrow = (req: Request) => {
  if (!req.userId) throw new AppError(401, "Authentication is required");
  return req.userId;
};

const paramOrThrow = (value: string | string[] | undefined, name: string) => {
  if (typeof value !== "string" || !value) {
    throw new AppError(400, `${name} is required`);
  }
  return value;
};

export const createCarpool = async (req: Request, res: Response) => {
  const carpool = await service.createCarpoolService(
    userIdOrThrow(req),
    createCarpoolSchema.parse(req.body),
  );
  return res.status(201).json({ carpool });
};

export const listCarpools = async (req: Request, res: Response) => {
  const result = await service.listCarpoolsService(
    userIdOrThrow(req),
    listCarpoolsSchema.parse(req.query),
  );
  return res.status(200).json(result);
};

export const getCarpoolDetails = async (req: Request, res: Response) => {
  const carpool = await service.getCarpoolDetailsService(
    paramOrThrow(req.params.id, "Carpool id"),
    userIdOrThrow(req),
  );
  return res.status(200).json({ carpool });
};

export const updateCarpool = async (req: Request, res: Response) => {
  const carpool = await service.updateCarpoolService(
    paramOrThrow(req.params.id, "Carpool id"),
    userIdOrThrow(req),
    updateCarpoolSchema.parse(req.body),
  );
  return res.status(200).json({ carpool });
};

export const cancelCarpool = async (req: Request, res: Response) => {
  const carpool = await service.cancelCarpoolService(
    paramOrThrow(req.params.id, "Carpool id"),
    userIdOrThrow(req),
  );
  return res.status(200).json({ carpool });
};

export const deleteCarpool = async (req: Request, res: Response) => {
  await service.deleteCarpoolService(
    paramOrThrow(req.params.id, "Carpool id"),
    userIdOrThrow(req),
  );

  return res.status(200).json({
    message: "Carpool deleted successfully",
  });
};

export const createJoinRequest = async (req: Request, res: Response) => {
  const request = await service.createJoinRequestService(
    paramOrThrow(req.params.id, "Carpool id"),
    userIdOrThrow(req),
  );
  return res.status(201).json({ request });
};

export const listIncomingRequests = async (req: Request, res: Response) => {
  const result = await service.listIncomingRequestsService(
    paramOrThrow(req.params.id, "Carpool id"),
    userIdOrThrow(req),
    paginationSchema.parse(req.query),
  );
  return res.status(200).json(result);
};

export const updateJoinRequest = async (req: Request, res: Response) => {
  const result = await service.updateJoinRequestService(
    paramOrThrow(req.params.id, "Carpool id"),
    paramOrThrow(req.params.requestId, "Request id"),
    userIdOrThrow(req),
    requestActionSchema.parse(req.body),
  );
  return res.status(200).json(result);
};

export const listMyCreatedCarpools = async (req: Request, res: Response) => {
  const carpools = await service.listMyCreatedCarpoolsService(userIdOrThrow(req));
  return res.status(200).json({ carpools });
};

export const listMyJoinedCarpools = async (req: Request, res: Response) => {
  const carpools = await service.listMyJoinedCarpoolsService(userIdOrThrow(req));
  return res.status(200).json({ carpools });
};

export const listMyRequests = async (req: Request, res: Response) => {
  const requests = await service.listMyRequestsService(userIdOrThrow(req));
  return res.status(200).json({ requests });
};
