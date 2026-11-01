import { apiRequest } from "@/lib/api";
import type {
  Carpool,
  CarpoolRequest,
  CreateCarpoolPayload,
  PublicUser,
} from "./carpools.types";

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type CarpoolListResponse = {
  carpools: Carpool[];
  pagination: Pagination;
};

export type IncomingCarpoolRequest = CarpoolRequest & {
  user: PublicUser;
  conversationId?: string | null;
};

export type UpdateCarpoolPayload = Partial<CreateCarpoolPayload>;

export const getCarpools = (search?: string) =>
  apiRequest<CarpoolListResponse>(
    `/carpools${search ? `?search=${encodeURIComponent(search)}` : ""}`,
  );

export const createCarpool = (payload: CreateCarpoolPayload) =>
  apiRequest<{ carpool: Carpool }>("/carpools", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const updateCarpool = (
  carpoolId: string,
  payload: Partial<CreateCarpoolPayload>,
) =>
  apiRequest<{ carpool: Carpool }>(`/carpools/${carpoolId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

export const cancelCarpool = (carpoolId: string) =>
  apiRequest<{ carpool: Carpool }>(`/carpools/${carpoolId}/cancel`, {
    method: "PATCH",
  });

  export const deleteCarpool = (carpoolId: string) =>
  apiRequest<{ message: string }>(`/carpools/${carpoolId}`, {
    method: "DELETE",
  });

export const requestToJoin = (carpoolId: string) =>
  apiRequest<{ request: CarpoolRequest }>(
    `/carpools/${carpoolId}/requests`,
    { method: "POST" },
  );

export const getMyCreatedCarpools = () =>
  apiRequest<{ carpools: Carpool[] }>("/carpools/me/created");

export const getMyJoinedCarpools = () =>
  apiRequest<{ carpools: Carpool[] }>("/carpools/me/joined");

export const getMyRequests = () =>
  apiRequest<{
    requests: Array<CarpoolRequest & { carpool: Carpool }>;
  }>("/carpools/me/requests");

export const getIncomingRequests = (carpoolId: string) =>
  apiRequest<{
    requests: IncomingCarpoolRequest[];
    pagination: Pagination;
  }>(`/carpools/${carpoolId}/requests`);

export const updateJoinRequest = (
  carpoolId: string,
  requestId: string,
  action: "ACCEPT" | "REJECT",
) =>
  apiRequest<{
    request: CarpoolRequest;
    member?: {
      id: string;
      carpoolId: string;
      userId: string;
      joinedAt: string;
    };
    conversationId?: string;
  }>(`/carpools/${carpoolId}/requests/${requestId}`, {
    method: "PATCH",
    body: JSON.stringify({ action }),
  });