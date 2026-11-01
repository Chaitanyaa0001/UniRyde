export declare const SESSION_TTL: number;
export declare const generateSessionId: () => string;
export declare const hashSessionId: (sessionId: string) => string;
export declare const getUserIdFromSession: (sessionId: string) => Promise<string | null>;
export declare const createSession: (userId: string) => Promise<string>;
export declare const deleteSession: (userId: string, sessionId: string) => Promise<void>;
export declare const deleteAllSessions: (userId: string) => Promise<void>;
//# sourceMappingURL=session.d.ts.map