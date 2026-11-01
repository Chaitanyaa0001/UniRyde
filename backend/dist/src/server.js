import { createServer } from "node:http";
import app from "./app.js";
import { env } from "./config/env.config.js";
import { redis } from "./lib/redis.js";
import { initSocket } from "./lib/socket.js";
const startServer = async () => {
    try {
        // Connect Redis before starting the server.
        await redis.connect();
        // Create one HTTP server for Express and Socket.IO.
        const httpServer = createServer(app);
        // Initialize Socket.IO on the same HTTP server.
        initSocket(httpServer);
        // Start listening.
        httpServer.listen(env.PORT, () => {
            console.log(`Server running on port: ${env.PORT}`);
        });
    }
    catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
};
startServer();
//# sourceMappingURL=server.js.map