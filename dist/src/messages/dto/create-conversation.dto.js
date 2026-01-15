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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateGroupConversationDto = exports.CreatePrivateConversationDto = exports.ConversationTypeDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
var ConversationTypeDto;
(function (ConversationTypeDto) {
    ConversationTypeDto["PRIVATE"] = "PRIVATE";
    ConversationTypeDto["GROUP"] = "GROUP";
})(ConversationTypeDto || (exports.ConversationTypeDto = ConversationTypeDto = {}));
class CreatePrivateConversationDto {
}
exports.CreatePrivateConversationDto = CreatePrivateConversationDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'userId123', description: 'User ID to chat with' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePrivateConversationDto.prototype, "userId", void 0);
class CreateGroupConversationDto {
}
exports.CreateGroupConversationDto = CreateGroupConversationDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'My Group Chat' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateGroupConversationDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'https://example.com/avatar.jpg' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateGroupConversationDto.prototype, "avatar", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: ['userId1', 'userId2'], description: 'Initial member IDs' }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateGroupConversationDto.prototype, "memberIds", void 0);
//# sourceMappingURL=create-conversation.dto.js.map