"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const apollo_server_express_1 = require("apollo-server-express");
const cors_1 = __importDefault(require("cors"));
const TypeDefs_1 = require("./graphql/TypeDefs");
const resolvers_1 = require("./graphql/resolvers");
const connection_1 = require("./database/connection");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
async function startServer() {
    const app = (0, express_1.default)();
    const port = process.env.PORT || 4000;
    // Enable CORS
    app.use((0, cors_1.default)());
    app.use(express_1.default.json());
    // Create Apollo Server
    const server = new apollo_server_express_1.ApolloServer({
        typeDefs: TypeDefs_1.typeDefs,
        resolvers: resolvers_1.resolvers,
        context: ({ req }) => ({
            // Add any context data here (e.g., user authentication)
            headers: req.headers
        }),
        // Enable GraphQL Playground in development
        introspection: process.env.NODE_ENV !== 'production',
        plugins: [
        // Add custom plugins here if needed
        ]
    });
    await server.start();
    // Apply the Apollo GraphQL middleware
    server.applyMiddleware({ app, path: '/graphql' });
    // Health check endpoint
    app.get('/health', async (req, res) => {
        try {
            const db = connection_1.DatabaseConnection.getInstance();
            const isConnected = await db.testConnection();
            res.json({
                status: 'ok',
                database: isConnected ? 'connected' : 'disconnected',
                graphql: 'active',
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            res.status(500).json({
                status: 'error',
                message: 'Health check failed',
                error: error instanceof Error ? error.message : error
            });
        }
    });
    // Start the HTTP server
    app.listen(port, () => {
        console.log(`🚀 GraphQL server ready at http://localhost:${port}${server.graphqlPath}`);
        console.log(`📊 GraphQL Playground: http://localhost:${port}${server.graphqlPath}`);
        console.log(`💚 Health check: http://localhost:${port}/health`);
    });
}
// Start the server
startServer().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
});
//# sourceMappingURL=graphql-server.js.map