import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
export declare class PrismaService implements OnModuleInit, OnModuleDestroy {
    private prisma;
    private pool;
    constructor();
    get user(): import("@prisma/client").Prisma.UserDelegate<import("@prisma/client/runtime/library").DefaultArgs>;
    get post(): import("@prisma/client").Prisma.PostDelegate<import("@prisma/client/runtime/library").DefaultArgs>;
    get $connect(): () => import("@prisma/client/runtime/library").JsPromise<void>;
    get $disconnect(): () => import("@prisma/client/runtime/library").JsPromise<void>;
    get $transaction(): {
        <P extends import("@prisma/client").Prisma.PrismaPromise<any>[]>(arg: [...P], options?: {
            isolationLevel?: import("@prisma/client").Prisma.TransactionIsolationLevel;
        }): import("@prisma/client/runtime/library").JsPromise<import("@prisma/client/runtime/library").UnwrapTuple<P>>;
        <R>(fn: (prisma: Omit<PrismaClient, import("@prisma/client/runtime/library").ITXClientDenyList>) => import("@prisma/client/runtime/library").JsPromise<R>, options?: {
            maxWait?: number;
            timeout?: number;
            isolationLevel?: import("@prisma/client").Prisma.TransactionIsolationLevel;
        }): import("@prisma/client/runtime/library").JsPromise<R>;
    };
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    cleanDatabase(): Promise<void>;
}
