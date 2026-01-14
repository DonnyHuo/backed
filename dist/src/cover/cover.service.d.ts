import { ConfigService } from '@nestjs/config';
export declare class CoverService {
    private configService;
    private readonly logger;
    private readonly cloudinaryConfig;
    private readonly backgroundImageUrls;
    constructor(configService: ConfigService);
    generateCover(title: string): Promise<string>;
    private buildCloudinaryUrl;
    private getFallbackCover;
}
