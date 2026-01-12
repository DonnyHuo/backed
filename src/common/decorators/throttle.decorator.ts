import { SetMetadata } from '@nestjs/common';

export const THROTTLE_LIMIT_KEY = 'throttle:limit';
export const THROTTLE_TTL_KEY = 'throttle:ttl';

export interface ThrottleOptions {
  limit: number; // Number of requests allowed
  ttl: number;   // Time window in seconds
}

/**
 * Custom throttle decorator for specific routes
 * @param options - Throttle options (limit and ttl)
 */
export const CustomThrottle = (options: ThrottleOptions) => {
  return (target: any, key?: string, descriptor?: PropertyDescriptor) => {
    SetMetadata(THROTTLE_LIMIT_KEY, options.limit)(target, key!, descriptor!);
    SetMetadata(THROTTLE_TTL_KEY, options.ttl)(target, key!, descriptor!);
    return descriptor;
  };
};

/**
 * Skip throttle for specific routes
 */
export const SkipThrottle = () => SetMetadata('skipThrottle', true);

