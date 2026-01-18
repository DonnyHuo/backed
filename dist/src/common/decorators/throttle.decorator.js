"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkipThrottle = exports.CustomThrottle = exports.THROTTLE_TTL_KEY = exports.THROTTLE_LIMIT_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.THROTTLE_LIMIT_KEY = 'throttle:limit';
exports.THROTTLE_TTL_KEY = 'throttle:ttl';
const CustomThrottle = (options) => {
    return (target, key, descriptor) => {
        (0, common_1.SetMetadata)(exports.THROTTLE_LIMIT_KEY, options.limit)(target, key, descriptor);
        (0, common_1.SetMetadata)(exports.THROTTLE_TTL_KEY, options.ttl)(target, key, descriptor);
        return descriptor;
    };
};
exports.CustomThrottle = CustomThrottle;
const SkipThrottle = () => (0, common_1.SetMetadata)('skipThrottle', true);
exports.SkipThrottle = SkipThrottle;
//# sourceMappingURL=throttle.decorator.js.map