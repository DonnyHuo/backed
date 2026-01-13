import { ClientBase } from 'pg';
export declare function query(sql: string, args: unknown[]): Promise<import("pg").QueryResult<any>>;
export declare function withConnection<T>(fn: (client: ClientBase) => Promise<T>): Promise<T>;
