"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FollowsController = void 0;
const common_1 = require("@nestjs/common");
const follows_service_1 = require("./follows.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const swagger_1 = require("@nestjs/swagger");
let FollowsController = class FollowsController {
    constructor(followsService) {
        this.followsService = followsService;
    }
    async toggleFollow(user, userId) {
        return this.followsService.toggleFollow(user.id, userId);
    }
    async checkFollowing(user, userId) {
        const isFollowing = await this.followsService.isFollowing(user.id, userId);
        return { isFollowing };
    }
    async getFollowers(userId, page, limit) {
        return this.followsService.getFollowers(userId, Number(page) || 1, Number(limit) || 20);
    }
    async getFollowing(userId, page, limit) {
        return this.followsService.getFollowing(userId, Number(page) || 1, Number(limit) || 20);
    }
    async getMyFollowers(user, page, limit) {
        return this.followsService.getFollowers(user.id, Number(page) || 1, Number(limit) || 20);
    }
    async getMyFollowing(user, page, limit) {
        return this.followsService.getFollowing(user.id, Number(page) || 1, Number(limit) || 20);
    }
    async getFollowCounts(userId) {
        return this.followsService.getFollowCounts(userId);
    }
};
exports.FollowsController = FollowsController;
__decorate([
    (0, common_1.Post)(':userId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Toggle follow/unfollow a user' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], FollowsController.prototype, "toggleFollow", null);
__decorate([
    (0, common_1.Get)('check/:userId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Check if current user is following a user' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], FollowsController.prototype, "checkFollowing", null);
__decorate([
    (0, common_1.Get)('followers/:userId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get followers of a user' }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], FollowsController.prototype, "getFollowers", null);
__decorate([
    (0, common_1.Get)('following/:userId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get users that a user is following' }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], FollowsController.prototype, "getFollowing", null);
__decorate([
    (0, common_1.Get)('my/followers'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get my followers' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number]),
    __metadata("design:returntype", Promise)
], FollowsController.prototype, "getMyFollowers", null);
__decorate([
    (0, common_1.Get)('my/following'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get users I am following' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number]),
    __metadata("design:returntype", Promise)
], FollowsController.prototype, "getMyFollowing", null);
__decorate([
    (0, common_1.Get)('counts/:userId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get follow counts for a user' }),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FollowsController.prototype, "getFollowCounts", null);
exports.FollowsController = FollowsController = __decorate([
    (0, swagger_1.ApiTags)('follows'),
    (0, common_1.Controller)('follows'),
    __metadata("design:paramtypes", [follows_service_1.FollowsService])
], FollowsController);
//# sourceMappingURL=follows.controller.js.map