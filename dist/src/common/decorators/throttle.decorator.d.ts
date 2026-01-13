export declare const THROTTLE_LIMIT_KEY = "throttle:limit";
export declare const THROTTLE_TTL_KEY = "throttle:ttl";
export interface ThrottleOptions {
    limit: number;
    ttl: number;
}
export declare const CustomThrottle: (options: ThrottleOptions) => (target: any, key?: string, descriptor?: PropertyDescriptor) => PropertyDescriptor | undefined;
export declare const SkipThrottle: () => import("@nestjs/common").CustomDecorator<string>;
