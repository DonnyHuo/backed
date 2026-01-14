import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import * as crypto from 'crypto';

@Injectable()
export class CoverService {
  private readonly logger = new Logger(CoverService.name);
  private readonly cloudinaryConfig: {
    cloud_name: string;
    api_key: string;
    api_secret: string;
  };

  // Background image URLs - using light-colored, bright images
  private readonly backgroundImageUrls = [
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

  constructor(private configService: ConfigService) {
    // Configure Cloudinary
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });

    this.cloudinaryConfig = {
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME') || '',
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY') || '',
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET') || '',
    };
  }

  /**
   * Generate a cover image using Cloudinary URL transformations
   * This works in serverless environments without native dependencies
   */
  async generateCover(title: string): Promise<string> {
    try {
      if (!this.cloudinaryConfig.cloud_name) {
        this.logger.warn('Cloudinary not configured, skipping cover generation');
        return '';
      }

      // Generate consistent hash for same title
      const hash = crypto.createHash('md5').update(title).digest('hex');

      // Select background image based on hash
      const imageIndex = parseInt(hash.substring(0, 2), 16) % this.backgroundImageUrls.length;
      const backgroundImageId = this.backgroundImageUrls[imageIndex];

      // Build Unsplash URL
      const unsplashUrl = `https://images.unsplash.com/${backgroundImageId}?w=1200&h=630&fit=crop&q=80`;

      // Use Cloudinary fetch to get the image with transformations
      const coverUrl = this.buildCloudinaryUrl(unsplashUrl);

      this.logger.log(`Generated cover URL for: ${title}`);
      return coverUrl;
    } catch (error) {
      this.logger.error(`Failed to generate cover: ${error.message}`);
      // Return a simple Unsplash URL as fallback
      return this.getFallbackCover(title);
    }
  }

  /**
   * Build Cloudinary URL with transformations
   */
  private buildCloudinaryUrl(sourceUrl: string): string {
    const cloudName = this.cloudinaryConfig.cloud_name;

    // Build transformation string for optimal quality
    const transformations = ['w_1200', 'h_630', 'c_fill', 'q_auto', 'f_auto'].join(',');

    // Use Cloudinary's fetch feature
    return `https://res.cloudinary.com/${cloudName}/image/fetch/${transformations}/${encodeURIComponent(sourceUrl)}`;
  }

  /**
   * Get fallback cover URL (just the background image without Cloudinary)
   */
  private getFallbackCover(title: string): string {
    const hash = crypto.createHash('md5').update(title).digest('hex');
    const imageIndex = parseInt(hash.substring(0, 2), 16) % this.backgroundImageUrls.length;
    const backgroundImageId = this.backgroundImageUrls[imageIndex];

    // Return direct Unsplash URL with good quality
    return `https://images.unsplash.com/${backgroundImageId}?w=1200&h=630&fit=crop&q=80`;
  }
}
