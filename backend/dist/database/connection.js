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
exports.DatabaseConnection = void 0;
const promise_1 = __importDefault(require("mysql2/promise"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
class DatabaseConnection {
    constructor() {
        this.connection = null;
        this.config = {
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '3306'),
            database: process.env.DB_NAME || 'tax_calculator',
            user: process.env.DB_USER || 'taxapp',
            password: process.env.DB_PASSWORD || 'taxpassword123'
        };
    }
    static getInstance() {
        if (!DatabaseConnection.instance) {
            DatabaseConnection.instance = new DatabaseConnection();
        }
        return DatabaseConnection.instance;
    }
    async connect() {
        if (!this.connection) {
            try {
                this.connection = await promise_1.default.createConnection(this.config);
                console.log('Connected to MySQL database');
            }
            catch (error) {
                console.error('Failed to connect to database:', error);
                throw error;
            }
        }
        return this.connection;
    }
    async disconnect() {
        if (this.connection) {
            await this.connection.end();
            this.connection = null;
            console.log('Disconnected from MySQL database');
        }
    }
    async testConnection() {
        try {
            const conn = await this.connect();
            await conn.ping();
            return true;
        }
        catch (error) {
            console.error('Database connection test failed:', error);
            return false;
        }
    }
}
exports.DatabaseConnection = DatabaseConnection;
//# sourceMappingURL=connection.js.map