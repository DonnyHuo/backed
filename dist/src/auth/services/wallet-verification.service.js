"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletVerificationService = void 0;
const common_1 = require("@nestjs/common");
const ethers_1 = require("ethers");
let WalletVerificationService = class WalletVerificationService {
    generateNonceMessage(nonce, appName = 'Posts App') {
        return `Sign this message to login to ${appName}\n\nNonce: ${nonce}\n\nThis request will not trigger a blockchain transaction or cost any fees.`;
    }
    async verifySignature(address, signature, nonce) {
        try {
            const message = this.generateNonceMessage(nonce);
            const recoveredAddress = (0, ethers_1.verifyMessage)(message, signature);
            return recoveredAddress.toLowerCase() === address.toLowerCase();
        }
        catch (error) {
            return false;
        }
    }
    isValidAddress(address) {
        return /^0x[a-fA-F0-9]{40}$/.test(address);
    }
};
exports.WalletVerificationService = WalletVerificationService;
exports.WalletVerificationService = WalletVerificationService = __decorate([
    (0, common_1.Injectable)()
], WalletVerificationService);
//# sourceMappingURL=wallet-verification.service.js.map