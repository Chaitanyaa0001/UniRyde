import type { Request, Response } from "express";
export declare const createCarpool: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const listCarpools: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getCarpoolDetails: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateCarpool: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const cancelCarpool: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const createJoinRequest: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const listIncomingRequests: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateJoinRequest: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const listMyCreatedCarpools: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const listMyJoinedCarpools: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const listMyRequests: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=carpool.controller.d.ts.map