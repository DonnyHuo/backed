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
exports.VerifyWalletDto = exports.RequestNonceDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class RequestNonceDto {
}
exports.RequestNonceDto = RequestNonceDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        description: 'Ethereum wallet address',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Matches)(/^0x[a-fA-F0-9]{40}$/, {
        message: 'Invalid Ethereum address format',
    }),
    __metadata("design:type", String)
], RequestNonceDto.prototype, "address", void 0);
class VerifyWalletDto {
}
exports.VerifyWalletDto = VerifyWalletDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        description: 'Ethereum wallet address',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Matches)(/^0x[a-fA-F0-9]{40}$/, {
        message: 'Invalid Ethereum address format',
    }),
    __metadata("design:type", String)
], VerifyWalletDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '0x1234567890abcdef...',
        description: 'Signature of the nonce message',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], VerifyWalletDto.prototype, "signature", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'random-nonce-string-123',
        description: 'Nonce that was signed',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], VerifyWalletDto.prototype, "nonce", void 0);
//# sourceMappingURL=wallet-login.dto.js.map