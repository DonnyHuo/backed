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
var PusherService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PusherService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const pusher_1 = require("pusher");
let PusherService = PusherService_1 = class PusherService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(PusherService_1.name);
        this.pusher = null;
        const appId = this.configService.get('PUSHER_APP_ID');
        const key = this.configService.get('PUSHER_KEY');
        const secret = this.configService.get('PUSHER_SECRET');
        const cluster = this.configService.get('PUSHER_CLUSTER');
        if (appId && key && secret && cluster) {
            this.pusher = new pusher_1.default({
                appId,
                key,
                secret,
                cluster,
                useTLS: true,
            });
            this.logger.log('Pusher initialized successfully');
        }
        else {
            this.logger.warn('Pusher not configured - real-time features disabled');
        }
    }
    async trigger(channel, event, data) {
        if (!this.pusher) {
            this.logger.warn('Pusher not configured, skipping event trigger');
            return;
        }
        try {
            await this.pusher.trigger(channel, event, data);
            this.logger.debug(`Triggered event "${event}" on channel "${channel}"`);
        }
        catch (error) {
            this.logger.error(`Failed to trigger Pusher event: ${error.message}`);
        }
    }
    async triggerBatch(events) {
        if (!this.pusher) {
            this.logger.warn('Pusher not configured, skipping batch trigger');
            return;
        }
        try {
            await this.pusher.triggerBatch(events);
            this.logger.debug(`Triggered batch of ${events.length} events`);
        }
        catch (error) {
            this.logger.error(`Failed to trigger Pusher batch: ${error.message}`);
        }
    }
    async sendMessageNotification(conversationId, message) {
        await this.trigger(`conversation-${conversationId}`, 'new-message', message);
    }
    async sendConversationUpdate(conversationId, event, data) {
        await this.trigger(`conversation-${conversationId}`, event, data);
    }
    async sendUserNotification(userId, event, data) {
        await this.trigger(`user-${userId}`, event, data);
    }
};
exports.PusherService = PusherService;
exports.PusherService = PusherService = PusherService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], PusherService);
//# sourceMappingURL=pusher.service.js.map