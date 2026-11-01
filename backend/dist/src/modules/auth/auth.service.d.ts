import type { LoginInput, RegisterInput } from "./auth.schema.js";
export declare const registerService: (data: RegisterInput) => Promise<{
    user: any;
}>;
export declare const loginService: (data: LoginInput) => Promise<{
    user: {
        id: any;
        username: any;
        email: any;
    };
    sessionId: string;
}>;
export declare const logoutService: (userId: string, sessionId: string) => Promise<void>;
export declare function logoutAllService(userId: string): Promise<void>;
//# sourceMappingURL=auth.service.d.ts.map