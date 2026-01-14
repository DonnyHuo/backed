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
var CoverService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoverService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const cloudinary_1 = require("cloudinary");
const crypto = require("crypto");
let CoverService = CoverService_1 = class CoverService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(CoverService_1.name);
        this.backgroundImageUrls = [
            'photo-1501594907352-04cda38ebc29',
            'photo-1518837695005-2083093ee35b',
            'photo-1506905925346-21bda4d32df4',
            'photo-1507525428034-b723cf961d3e',
            'photo-1505142468610-359e7d316be0',
            'photo-1557682250-33bd709cbe85',
            'photo-1557683311-eac922347aa1',
            'photo-1557683316-973673baf926',
            'photo-1557672172-298e090bd0f1',
            'photo-1469474968028-56623f02e42e',
            'photo-1511497584788-876760111969',
            'photo-1441974231531-c6227db76b6e',
            'photo-1519681393784-d120267933ba',
            'photo-1514565131-fce0801e5785',
            'photo-1496564203459-88bb75ec47b4',
        ];
        cloudinary_1.v2.config({
            cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
            api_key: this.configService.get('CLOUDINARY_API_KEY'),
            api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
        });
        this.cloudinaryConfig = {
            cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME') || '',
            api_key: this.configService.get('CLOUDINARY_API_KEY') || '',
            api_secret: this.configService.get('CLOUDINARY_API_SECRET') || '',
        };
    }
    async generateCover(title) {
        try {
            if (!this.cloudinaryConfig.cloud_name) {
                this.logger.warn('Cloudinary not configured, skipping cover generation');
                return '';
            }
            const hash = crypto.createHash('md5').update(title).digest('hex');
            const imageIndex = parseInt(hash.substring(0, 2), 16) % this.backgroundImageUrls.length;
            const backgroundImageId = this.backgroundImageUrls[imageIndex];
            const unsplashUrl = `https://images.unsplash.com/${backgroundImageId}?w=1200&h=630&fit=crop&q=80`;
            const coverUrl = this.buildCloudinaryUrl(unsplashUrl);
            this.logger.log(`Generated cover URL for: ${title}`);
            return coverUrl;
        }
        catch (error) {
            this.logger.error(`Failed to generate cover: ${error.message}`);
            return this.getFallbackCover(title);
        }
    }
    buildCloudinaryUrl(sourceUrl) {
        const cloudName = this.cloudinaryConfig.cloud_name;
        const transformations = ['w_1200', 'h_630', 'c_fill', 'q_auto', 'f_auto'].join(',');
        return `https://res.cloudinary.com/${cloudName}/image/fetch/${transformations}/${encodeURIComponent(sourceUrl)}`;
    }
    getFallbackCover(title) {
        const hash = crypto.createHash('md5').update(title).digest('hex');
        const imageIndex = parseInt(hash.substring(0, 2), 16) % this.backgroundImageUrls.length;
        const backgroundImageId = this.backgroundImageUrls[imageIndex];
        return `https://images.unsplash.com/${backgroundImageId}?w=1200&h=630&fit=crop&q=80`;
    }
};
exports.CoverService = CoverService;
exports.CoverService = CoverService = CoverService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], CoverService);
//# sourceMappingURL=cover.service.js.map