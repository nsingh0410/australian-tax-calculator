import mysql from 'mysql2/promise';
export interface DatabaseConfig {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
}
export declare class DatabaseConnection {
    private static instance;
    private connection;
    private config;
    private constructor();
    static getInstance(): DatabaseConnection;
    connect(): Promise<mysql.Connection>;
    disconnect(): Promise<void>;
    testConnection(): Promise<boolean>;
}
//# sourceMappingURL=connection.d.ts.map