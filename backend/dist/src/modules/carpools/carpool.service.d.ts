import { type $Enums } from "../../../generated/prisma/client.js";
import type { CreateCarpoolInput, ListCarpoolsInput, PaginationInput, AcceptRequestInput, RejectRequestInput, RequestActionInput, UpdateCarpoolInput } from "./carpool.schema.js";
export declare const createCarpoolService: (userId: string, data: CreateCarpoolInput) => Promise<any>;
export declare const listCarpoolsService: (userId: string, data: ListCarpoolsInput) => Promise<{
    carpools: any;
    pagination: {
        page: number;
        limit: number;
        total: any;
        totalPages: number;
    };
}>;
export declare const getCarpoolDetailsService: (id: string, userId: string) => Promise<any>;
export declare const updateCarpoolService: (id: string, userId: string, data: UpdateCarpoolInput) => Promise<any>;
export declare const cancelCarpoolService: (id: string, userId: string) => Promise<any>;
export declare const createJoinRequestService: (carpoolId: string, userId: string) => Promise<any>;
export declare const listIncomingRequestsService: (carpoolId: string, userId: string, data: PaginationInput) => Promise<{
    requests: any;
    pagination: {
        page: number;
        limit: number;
        total: any;
        totalPages: number;
    };
}>;
type JoinRequestSummary = {
    id: string;
    carpoolId: string;
    userId: string;
    status: $Enums.CarpoolRequestStatus;
    createdAt: Date;
    updatedAt: Date;
};
type MemberSummary = {
    id: string;
    carpoolId: string;
    userId: string;
    joinedAt: Date;
};
type AcceptedRequestResult = {
    request: JoinRequestSummary;
    member: MemberSummary;
    conversationId: string;
};
type RejectedRequestResult = {
    request: JoinRequestSummary;
};
export declare function updateJoinRequestService(carpoolId: string, requestId: string, userId: string, data: AcceptRequestInput): Promise<AcceptedRequestResult>;
export declare function updateJoinRequestService(carpoolId: string, requestId: string, userId: string, data: RejectRequestInput): Promise<RejectedRequestResult>;
export declare function updateJoinRequestService(carpoolId: string, requestId: string, userId: string, data: RequestActionInput): Promise<AcceptedRequestResult | RejectedRequestResult>;
export declare const listMyCreatedCarpoolsService: (userId: string) => Promise<any>;
export declare const listMyJoinedCarpoolsService: (userId: string) => Promise<any>;
export declare const listMyRequestsService: (userId: string) => Promise<any>;
export {};
//# sourceMappingURL=carpool.service.d.ts.map