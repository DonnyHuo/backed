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
const canvas_1 = require("canvas");
const cloudinary_1 = require("cloudinary");
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");
let CoverService = CoverService_1 = class CoverService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(CoverService_1.name);
        this.backgroundImageUrls = [
            'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1200&h=630&fit=crop&q=80',
            'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1200&h=630&fit=crop&q=80',
            'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=630&fit=crop&q=80',
            'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=630&fit=crop&q=80',
            'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=1200&h=630&fit=crop&q=80',
            'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1200&h=630&fit=crop&q=80',
            'https://images.unsplash.com/photo-1557683311-eac922347aa1?w=1200&h=630&fit=crop&q=80',
            'https://images.unsplash.com/photo-1557683316-973673baf926?w=1200&h=630&fit=crop&q=80',
            'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=1200&h=630&fit=crop&q=80',
            'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&h=630&fit=crop&q=80',
            'https://images.unsplash.com/photo-1511497584788-876760111969?w=1200&h=630&fit=crop&q=80',
            'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&h=630&fit=crop&q=80',
            'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&h=630&fit=crop&q=80',
            'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1200&h=630&fit=crop&q=80',
            'https://images.unsplash.com/photo-1496564203459-88bb75ec47b4?w=1200&h=630&fit=crop&q=80',
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
        try {
            const possiblePaths = [
                path.join(__dirname, '../../assets/fonts/GravitasOne-Regular.ttf'),
                path.join(process.cwd(), 'assets/fonts/GravitasOne-Regular.ttf'),
                path.join(__dirname, '../../../assets/fonts/GravitasOne-Regular.ttf'),
            ];
            let fontPath = null;
            for (const testPath of possiblePaths) {
                try {
                    if (fs.existsSync(testPath)) {
                        fontPath = testPath;
                        break;
                    }
                }
                catch {
                }
            }
            if (fontPath) {
                (0, canvas_1.registerFont)(fontPath, { family: 'Gravitas One' });
                this.logger.log(`Gravitas One font registered successfully from: ${fontPath}`);
            }
            else {
                throw new Error('Font file not found in any expected location');
            }
        }
        catch (error) {
            this.logger.warn(`Could not register Gravitas One font: ${error.message}`);
            this.logger.warn('Will use fallback font instead');
        }
    }
    generateRandomColor() {
        const colors = [
            '#FF6B6B',
            '#4ECDC4',
            '#45B7D1',
            '#FFA07A',
            '#98D8C8',
            '#F7DC6F',
            '#BB8FCE',
            '#85C1E2',
            '#F8B739',
            '#52BE80',
            '#EC7063',
            '#5DADE2',
            '#F4D03F',
            '#AF7AC5',
            '#48C9B0',
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    async generateCover(title, _content) {
        try {
            const hash = crypto.createHash('md5').update(title).digest('hex');
            const imageIndex = parseInt(hash.substring(0, 2), 16) % this.backgroundImageUrls.length;
            const backgroundImageUrl = this.backgroundImageUrls[imageIndex];
            this.logger.log(`Loading background image: ${backgroundImageUrl}`);
            const backgroundImage = await (0, canvas_1.loadImage)(backgroundImageUrl);
            const width = backgroundImage.width;
            const height = backgroundImage.height;
            const canvas = (0, canvas_1.createCanvas)(width, height);
            const ctx = canvas.getContext('2d');
            ctx.drawImage(backgroundImage, 0, 0, width, height);
            this.drawTitleOnImage(ctx, width, height, title);
            const buffer = canvas.toBuffer('image/png');
            if (this.cloudinaryConfig.cloud_name) {
                return await this.uploadToCloudinary(buffer);
            }
            else {
                if (process.env.NODE_ENV === 'production') {
                    throw new Error('Cloudinary configuration is required for production');
                }
                return await this.saveLocally(buffer);
            }
        }
        catch (error) {
            this.logger.error(`Failed to load background image: ${error.message}`);
            return this.generateCoverFallback(title);
        }
    }
    async generateCoverFallback(title) {
        const width = 1200;
        const height = 630;
        const canvas = (0, canvas_1.createCanvas)(width, height);
        const ctx = canvas.getContext('2d');
        const hash = crypto.createHash('md5').update(title).digest('hex');
        const colors = this.generateColorsFromHash(hash);
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, colors.primary);
        gradient.addColorStop(1, colors.secondary);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        this.drawTitleOnImage(ctx, width, height, title);
        const buffer = canvas.toBuffer('image/png');
        if (this.cloudinaryConfig.cloud_name) {
            return await this.uploadToCloudinary(buffer);
        }
        else {
            if (process.env.NODE_ENV === 'production') {
                throw new Error('Cloudinary configuration is required for production');
            }
            return await this.saveLocally(buffer);
        }
    }
    generateColorsFromHash(hash) {
        const palettes = [
            { primary: '#667eea', secondary: '#764ba2', accent: '#f093fb', text: '#ffffff' },
            { primary: '#f093fb', secondary: '#f5576c', accent: '#4facfe', text: '#ffffff' },
            { primary: '#4facfe', secondary: '#00f2fe', accent: '#43e97b', text: '#ffffff' },
            { primary: '#a8edea', secondary: '#fed6e3', accent: '#ff9a9e', text: '#2d3748' },
            { primary: '#ffecd2', secondary: '#fcb69f', accent: '#ff6b6b', text: '#2d3748' },
            { primary: '#89f7fe', secondary: '#66a6ff', accent: '#a8c0ff', text: '#1a202c' },
            { primary: '#ff9a9e', secondary: '#fecfef', accent: '#fecfef', text: '#ffffff' },
            { primary: '#a8edea', secondary: '#fed6e3', accent: '#ffecd2', text: '#2d3748' },
        ];
        const paletteIndex = parseInt(hash.substring(0, 2), 16) % palettes.length;
        return palettes[paletteIndex];
    }
    applyTemplate(ctx, width, height, templateIndex, colors) {
        switch (templateIndex) {
            case 0:
                this.drawLinearGradient(ctx, width, height, colors.primary, colors.secondary);
                break;
            case 1:
                this.drawRadialGradient(ctx, width, height, colors.primary, colors.secondary);
                break;
            case 2:
                this.drawDiagonalStripes(ctx, width, height, colors.primary, colors.secondary);
                break;
            case 3:
                this.drawGeometricShapes(ctx, width, height, colors.primary, colors.secondary, colors.accent);
                break;
            case 4:
                this.drawMeshGradient(ctx, width, height, colors.primary, colors.secondary, colors.accent);
                break;
            case 5:
                this.drawWavePattern(ctx, width, height, colors.primary, colors.secondary);
                break;
            default:
                this.drawLinearGradient(ctx, width, height, colors.primary, colors.secondary);
        }
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(0, 0, width, height);
    }
    drawLinearGradient(ctx, width, height, color1, color2) {
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, color1);
        gradient.addColorStop(1, color2);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
    }
    drawRadialGradient(ctx, width, height, color1, color2) {
        const gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.max(width, height));
        gradient.addColorStop(0, color1);
        gradient.addColorStop(1, color2);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
    }
    drawDiagonalStripes(ctx, width, height, color1, color2) {
        ctx.fillStyle = color1;
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = color2;
        const stripeWidth = 60;
        for (let i = -height; i < width + height; i += stripeWidth * 2) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i + stripeWidth, 0);
            ctx.lineTo(i + stripeWidth + height, height);
            ctx.lineTo(i + height, height);
            ctx.closePath();
            ctx.fill();
        }
    }
    drawGeometricShapes(ctx, width, height, color1, color2, color3) {
        this.drawLinearGradient(ctx, width, height, color1, color2);
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = color3;
        ctx.beginPath();
        ctx.arc(width * 0.2, height * 0.3, 150, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = color2;
        ctx.beginPath();
        ctx.moveTo(width * 0.8, height * 0.2);
        ctx.lineTo(width * 0.95, height * 0.5);
        ctx.lineTo(width * 0.65, height * 0.5);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = color1;
        ctx.fillRect(width * 0.7, height * 0.6, 200, 120);
        ctx.globalAlpha = 1.0;
    }
    drawMeshGradient(ctx, width, height, color1, color2, color3) {
        ctx.fillStyle = color1;
        ctx.fillRect(0, 0, width, height);
        ctx.globalAlpha = 0.5;
        const grad1 = ctx.createRadialGradient(width * 0.3, height * 0.3, 0, width * 0.3, height * 0.3, 400);
        grad1.addColorStop(0, color2);
        grad1.addColorStop(1, 'transparent');
        ctx.fillStyle = grad1;
        ctx.fillRect(0, 0, width, height);
        const grad2 = ctx.createRadialGradient(width * 0.7, height * 0.7, 0, width * 0.7, height * 0.7, 400);
        grad2.addColorStop(0, color3);
        grad2.addColorStop(1, 'transparent');
        ctx.fillStyle = grad2;
        ctx.fillRect(0, 0, width, height);
        ctx.globalAlpha = 1.0;
    }
    drawWavePattern(ctx, width, height, color1, color2) {
        this.drawLinearGradient(ctx, width, height, color1, color2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 3;
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            const y = (height / 5) * i;
            const frequency = 0.02;
            const amplitude = 30;
            for (let x = 0; x < width; x += 2) {
                const waveY = y + Math.sin(x * frequency + i) * amplitude;
                if (x === 0) {
                    ctx.moveTo(x, waveY);
                }
                else {
                    ctx.lineTo(x, waveY);
                }
            }
            ctx.stroke();
        }
    }
    drawTitleOnImage(ctx, width, height, title) {
        const BASE_FONT_SIZE = 40;
        const SCALE_FACTOR = 3.5;
        const maxLines = 3;
        const lineHeightRatio = 1.25;
        const effectiveFontSize = BASE_FONT_SIZE * SCALE_FACTOR;
        this.logger.log(`[COVER] Drawing title "${title}" - Base: ${BASE_FONT_SIZE}px, Scale: ${SCALE_FACTOR}x, Effective: ${effectiveFontSize}px`);
        const tempCanvas = (0, canvas_1.createCanvas)(1, 1);
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.font = `bold ${BASE_FONT_SIZE}px "Gravitas One", "Arial Black", Arial, sans-serif`;
        const wrappedTitle = this.wrapText(tempCtx, title);
        const finalWrappedTitle = wrappedTitle.slice(0, maxLines);
        const actualLines = finalWrappedTitle.length;
        const baseLineHeight = BASE_FONT_SIZE * lineHeightRatio;
        const totalTextHeight = (actualLines - 1) * baseLineHeight;
        const baseTitleY = height / SCALE_FACTOR / 2 - totalTextHeight / 2;
        ctx.save();
        ctx.scale(SCALE_FACTOR, SCALE_FACTOR);
        ctx.font = `bold ${BASE_FONT_SIZE}px "Gravitas One", "Arial Black", Arial, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        finalWrappedTitle.forEach((line, index) => {
            const y = baseTitleY + index * baseLineHeight;
            const centerX = width / SCALE_FACTOR / 2;
            const lineColor = this.generateRandomColor();
            ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
            ctx.shadowBlur = 4;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 2;
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.lineWidth = 1;
            ctx.strokeText(line, centerX, y);
            ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
            ctx.shadowBlur = 2;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 1;
            ctx.fillStyle = lineColor;
            ctx.fillText(line, centerX, y);
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            ctx.strokeStyle = 'transparent';
            ctx.lineWidth = 0;
        });
        ctx.restore();
        this.logger.log(`[COVER] Title drawn - ${actualLines} lines, effective font size: ${effectiveFontSize}px`);
    }
    drawDecorativeElements(ctx, width, height, colors, templateIndex) {
        ctx.globalAlpha = 0.15;
        switch (templateIndex % 3) {
            case 0:
                this.drawCornerDecorations(ctx, width, height, colors.accent);
                break;
            case 1:
                this.drawFloatingShapes(ctx, width, height, colors.accent);
                break;
            case 2:
                this.drawGridPattern(ctx, width, height, colors.accent);
                break;
        }
        ctx.globalAlpha = 1.0;
    }
    drawCornerDecorations(ctx, width, height, color) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(40, 40);
        ctx.lineTo(120, 40);
        ctx.lineTo(40, 120);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(width - 40, 40);
        ctx.lineTo(width - 120, 40);
        ctx.lineTo(width - 40, 120);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(40, height - 40);
        ctx.lineTo(120, height - 40);
        ctx.lineTo(40, height - 120);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(width - 40, height - 40);
        ctx.lineTo(width - 120, height - 40);
        ctx.lineTo(width - 40, height - 120);
        ctx.stroke();
    }
    drawFloatingShapes(ctx, width, height, color) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(width * 0.15, height * 0.2, 40, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(width * 0.85, height * 0.8, 60, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(width * 0.1, height * 0.75, 80, 80);
        ctx.fillRect(width * 0.85, height * 0.15, 70, 70);
    }
    drawGridPattern(ctx, width, height, color) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        const gridSize = 60;
        for (let x = 0; x < width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
        for (let y = 0; y < height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
    }
    calculateFontSizeForHeight(text, maxWidth, preferredSize, maxSize, minSize) {
        const canvas = (0, canvas_1.createCanvas)(1, 1);
        const ctx = canvas.getContext('2d');
        let fontSize = preferredSize;
        ctx.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto`;
        const textWidth = ctx.measureText(text).width;
        if (textWidth < maxWidth * 0.4) {
            fontSize = Math.min(maxSize, preferredSize * 1.3);
            ctx.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto`;
            if (ctx.measureText(text).width > maxWidth) {
                fontSize = preferredSize;
                ctx.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto`;
            }
        }
        while (ctx.measureText(text).width > maxWidth && fontSize > minSize) {
            fontSize -= 5;
            ctx.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto`;
        }
        return Math.max(fontSize, minSize);
    }
    calculateFontSize(text, maxWidth, maxSize, minSize) {
        const canvas = (0, canvas_1.createCanvas)(1, 1);
        const ctx = canvas.getContext('2d');
        let fontSize = maxSize;
        ctx.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto`;
        const textWidth = ctx.measureText(text).width;
        if (textWidth < maxWidth * 0.5) {
            fontSize = Math.min(maxSize + 200, 700);
            ctx.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto`;
            if (ctx.measureText(text).width > maxWidth) {
                fontSize = maxSize;
                ctx.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto`;
            }
        }
        while (ctx.measureText(text).width > maxWidth && fontSize > minSize) {
            fontSize -= 2;
            ctx.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto`;
        }
        return Math.max(fontSize, minSize);
    }
    wrapText(_ctx, text) {
        const lines = [];
        const charsPerLine = 3 + Math.floor(Math.random() * 2);
        const characters = Array.from(text);
        for (let i = 0; i < characters.length; i += charsPerLine) {
            const line = characters.slice(i, i + charsPerLine).join('');
            if (line.trim()) {
                lines.push(line);
            }
        }
        return lines;
    }
    async uploadToCloudinary(buffer) {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary_1.v2.uploader.upload_stream({
                folder: 'covers',
                resource_type: 'image',
                format: 'png',
                transformation: [{ quality: 'auto' }, { fetch_format: 'auto' }],
            }, (error, result) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(result.secure_url);
                }
            });
            uploadStream.end(buffer);
        });
    }
    async saveLocally(buffer) {
        const fs = await Promise.resolve().then(() => require('fs/promises'));
        const path = await Promise.resolve().then(() => require('path'));
        const coversDir = path.join(process.cwd(), 'public', 'covers');
        try {
            await fs.access(coversDir);
        }
        catch {
            await fs.mkdir(coversDir, { recursive: true });
        }
        const filename = `cover_${Date.now()}.png`;
        const filepath = path.join(coversDir, filename);
        await fs.writeFile(filepath, buffer);
        const baseUrl = this.configService.get('BASE_URL') || 'http://localhost:3000';
        return `${baseUrl}/covers/${filename}`;
    }
    extractFontSize(fontString) {
        const match = fontString.match(/(\d+)px/);
        return match ? parseInt(match[1], 10) : 0;
    }
};
exports.CoverService = CoverService;
exports.CoverService = CoverService = CoverService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], CoverService);
//# sourceMappingURL=cover.service.js.map