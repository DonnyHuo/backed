import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  createCanvas,
  loadImage,
  CanvasRenderingContext2D as CanvasContext2D,
  registerFont,
} from 'canvas';
import { v2 as cloudinary } from 'cloudinary';
import * as crypto from 'crypto';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class CoverService {
  private readonly logger = new Logger(CoverService.name);
  private readonly cloudinaryConfig: {
    cloud_name: string;
    api_key: string;
    api_secret: string;
  };

  // Background image URLs - using light-colored, bright images for better text visibility
  // Curated light and bright images for better visual appeal
  private readonly backgroundImageUrls = [
    // Light sky and clouds (very light backgrounds)
    'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1200&h=630&fit=crop&q=80',
    'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1200&h=630&fit=crop&q=80',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=630&fit=crop&q=80',
    // Light beach scenes
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=630&fit=crop&q=80',
    'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=1200&h=630&fit=crop&q=80',
    // Light pastel backgrounds
    'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1200&h=630&fit=crop&q=80',
    'https://images.unsplash.com/photo-1557683311-eac922347aa1?w=1200&h=630&fit=crop&q=80',
    // Light minimal abstract
    'https://images.unsplash.com/photo-1557683316-973673baf926?w=1200&h=630&fit=crop&q=80',
    'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=1200&h=630&fit=crop&q=80',
    // Light nature - flowers and plants
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&h=630&fit=crop&q=80',
    'https://images.unsplash.com/photo-1511497584788-876760111969?w=1200&h=630&fit=crop&q=80',
    // Light landscapes
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&h=630&fit=crop&q=80',
    'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&h=630&fit=crop&q=80',
    // Light cityscapes
    'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1200&h=630&fit=crop&q=80',
    'https://images.unsplash.com/photo-1496564203459-88bb75ec47b4?w=1200&h=630&fit=crop&q=80',
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

    // Register Gravitas One font
    try {
      // Try multiple possible paths (for both dev and production)
      const possiblePaths = [
        path.join(__dirname, '../../assets/fonts/GravitasOne-Regular.ttf'), // dist/src/cover -> assets/fonts
        path.join(process.cwd(), 'assets/fonts/GravitasOne-Regular.ttf'), // From project root
        path.join(__dirname, '../../../assets/fonts/GravitasOne-Regular.ttf'), // Alternative path
      ];

      let fontPath: string | null = null;
      for (const testPath of possiblePaths) {
        try {
          if (fs.existsSync(testPath)) {
            fontPath = testPath;
            break;
          }
        } catch {
          // Continue to next path
        }
      }

      if (fontPath) {
        registerFont(fontPath, { family: 'Gravitas One' });
        this.logger.log(`Gravitas One font registered successfully from: ${fontPath}`);
      } else {
        throw new Error('Font file not found in any expected location');
      }
    } catch (error) {
      this.logger.warn(`Could not register Gravitas One font: ${error.message}`);
      this.logger.warn('Will use fallback font instead');
    }
  }

  /**
   * Generate a random color (bright colors for better visibility)
   */
  private generateRandomColor(): string {
    // Generate bright, vibrant colors
    const colors = [
      '#FF6B6B', // Red
      '#4ECDC4', // Teal
      '#45B7D1', // Blue
      '#FFA07A', // Light Salmon
      '#98D8C8', // Mint
      '#F7DC6F', // Yellow
      '#BB8FCE', // Purple
      '#85C1E2', // Sky Blue
      '#F8B739', // Orange
      '#52BE80', // Green
      '#EC7063', // Coral
      '#5DADE2', // Light Blue
      '#F4D03F', // Gold
      '#AF7AC5', // Lavender
      '#48C9B0', // Turquoise
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  /**
   * Generate a cover image for a post using background image + text overlay
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async generateCover(title: string, _content?: string): Promise<string> {
    try {
      // Select a random background image based on title hash (consistent for same title)
      const hash = crypto.createHash('md5').update(title).digest('hex');
      const imageIndex = parseInt(hash.substring(0, 2), 16) % this.backgroundImageUrls.length;
      const backgroundImageUrl = this.backgroundImageUrls[imageIndex];

      this.logger.log(`Loading background image: ${backgroundImageUrl}`);

      // Load background image first to get its actual dimensions
      const backgroundImage = await loadImage(backgroundImageUrl);

      // Use image's actual dimensions for canvas (don't exceed image size)
      const width = backgroundImage.width;
      const height = backgroundImage.height;

      // Create canvas matching image size
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext('2d');

      // Draw background image (cover entire canvas)
      ctx.drawImage(backgroundImage, 0, 0, width, height);

      // No overlay - keep image pure and beautiful
      // Draw title directly on image with strong contrast
      this.drawTitleOnImage(ctx, width, height, title);

      // Convert canvas to buffer
      const buffer = canvas.toBuffer('image/png');

      // Upload to Cloudinary or save locally
      if (this.cloudinaryConfig.cloud_name) {
        return await this.uploadToCloudinary(buffer);
      } else {
        if (process.env.NODE_ENV === 'production') {
          throw new Error('Cloudinary configuration is required for production');
        }
        return await this.saveLocally(buffer);
      }
    } catch (error) {
      this.logger.error(`Failed to load background image: ${error.message}`);
      // Fallback to simple gradient background if image loading fails
      return this.generateCoverFallback(title);
    }
  }

  /**
   * Fallback method: Generate cover with gradient background if image loading fails
   */
  private async generateCoverFallback(title: string): Promise<string> {
    const width = 1200;
    const height = 630;

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Simple gradient background
    const hash = crypto.createHash('md5').update(title).digest('hex');
    const colors = this.generateColorsFromHash(hash);
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, colors.primary);
    gradient.addColorStop(1, colors.secondary);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // No overlay - keep background pure
    // Draw title directly
    this.drawTitleOnImage(ctx, width, height, title);

    const buffer = canvas.toBuffer('image/png');

    if (this.cloudinaryConfig.cloud_name) {
      return await this.uploadToCloudinary(buffer);
    } else {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('Cloudinary configuration is required for production');
      }
      return await this.saveLocally(buffer);
    }
  }

  /**
   * Generate beautiful color palette from hash
   */
  private generateColorsFromHash(hash: string): {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
  } {
    // Predefined beautiful color palettes
    const palettes = [
      // Blue-Purple
      { primary: '#667eea', secondary: '#764ba2', accent: '#f093fb', text: '#ffffff' },
      // Orange-Pink
      { primary: '#f093fb', secondary: '#f5576c', accent: '#4facfe', text: '#ffffff' },
      // Green-Teal
      { primary: '#4facfe', secondary: '#00f2fe', accent: '#43e97b', text: '#ffffff' },
      // Purple-Pink
      { primary: '#a8edea', secondary: '#fed6e3', accent: '#ff9a9e', text: '#2d3748' },
      // Orange-Yellow
      { primary: '#ffecd2', secondary: '#fcb69f', accent: '#ff6b6b', text: '#2d3748' },
      // Blue-Cyan
      { primary: '#89f7fe', secondary: '#66a6ff', accent: '#a8c0ff', text: '#1a202c' },
      // Pink-Red
      { primary: '#ff9a9e', secondary: '#fecfef', accent: '#fecfef', text: '#ffffff' },
      // Green-Blue
      { primary: '#a8edea', secondary: '#fed6e3', accent: '#ffecd2', text: '#2d3748' },
    ];

    // Select palette based on hash
    const paletteIndex = parseInt(hash.substring(0, 2), 16) % palettes.length;
    return palettes[paletteIndex];
  }

  /**
   * Apply different template styles
   */
  private applyTemplate(
    ctx: CanvasContext2D,
    width: number,
    height: number,
    templateIndex: number,
    colors: { primary: string; secondary: string; accent: string; text: string },
  ): void {
    switch (templateIndex) {
      case 0:
        // Linear gradient
        this.drawLinearGradient(ctx, width, height, colors.primary, colors.secondary);
        break;
      case 1:
        // Radial gradient
        this.drawRadialGradient(ctx, width, height, colors.primary, colors.secondary);
        break;
      case 2:
        // Diagonal stripes
        this.drawDiagonalStripes(ctx, width, height, colors.primary, colors.secondary);
        break;
      case 3:
        // Geometric shapes
        this.drawGeometricShapes(
          ctx,
          width,
          height,
          colors.primary,
          colors.secondary,
          colors.accent,
        );
        break;
      case 4:
        // Mesh gradient
        this.drawMeshGradient(ctx, width, height, colors.primary, colors.secondary, colors.accent);
        break;
      case 5:
        // Wave pattern
        this.drawWavePattern(ctx, width, height, colors.primary, colors.secondary);
        break;
      default:
        this.drawLinearGradient(ctx, width, height, colors.primary, colors.secondary);
    }

    // Add subtle overlay for better text readability
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(0, 0, width, height);
  }

  /**
   * Draw linear gradient background
   */
  private drawLinearGradient(
    ctx: CanvasContext2D,
    width: number,
    height: number,
    color1: string,
    color2: string,
  ): void {
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, color1);
    gradient.addColorStop(1, color2);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }

  /**
   * Draw radial gradient background
   */
  private drawRadialGradient(
    ctx: CanvasContext2D,
    width: number,
    height: number,
    color1: string,
    color2: string,
  ): void {
    const gradient = ctx.createRadialGradient(
      width / 2,
      height / 2,
      0,
      width / 2,
      height / 2,
      Math.max(width, height),
    );
    gradient.addColorStop(0, color1);
    gradient.addColorStop(1, color2);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }

  /**
   * Draw diagonal stripes
   */
  private drawDiagonalStripes(
    ctx: CanvasContext2D,
    width: number,
    height: number,
    color1: string,
    color2: string,
  ): void {
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

  /**
   * Draw geometric shapes
   */
  private drawGeometricShapes(
    ctx: CanvasContext2D,
    width: number,
    height: number,
    color1: string,
    color2: string,
    color3: string,
  ): void {
    // Base gradient
    this.drawLinearGradient(ctx, width, height, color1, color2);

    // Add geometric shapes
    ctx.globalAlpha = 0.3;

    // Circle
    ctx.fillStyle = color3;
    ctx.beginPath();
    ctx.arc(width * 0.2, height * 0.3, 150, 0, Math.PI * 2);
    ctx.fill();

    // Triangle
    ctx.fillStyle = color2;
    ctx.beginPath();
    ctx.moveTo(width * 0.8, height * 0.2);
    ctx.lineTo(width * 0.95, height * 0.5);
    ctx.lineTo(width * 0.65, height * 0.5);
    ctx.closePath();
    ctx.fill();

    // Rectangle
    ctx.fillStyle = color1;
    ctx.fillRect(width * 0.7, height * 0.6, 200, 120);

    ctx.globalAlpha = 1.0;
  }

  /**
   * Draw mesh gradient (multiple overlapping gradients)
   */
  private drawMeshGradient(
    ctx: CanvasContext2D,
    width: number,
    height: number,
    color1: string,
    color2: string,
    color3: string,
  ): void {
    // Base color
    ctx.fillStyle = color1;
    ctx.fillRect(0, 0, width, height);

    // Overlay gradients
    ctx.globalAlpha = 0.5;

    const grad1 = ctx.createRadialGradient(
      width * 0.3,
      height * 0.3,
      0,
      width * 0.3,
      height * 0.3,
      400,
    );
    grad1.addColorStop(0, color2);
    grad1.addColorStop(1, 'transparent');
    ctx.fillStyle = grad1;
    ctx.fillRect(0, 0, width, height);

    const grad2 = ctx.createRadialGradient(
      width * 0.7,
      height * 0.7,
      0,
      width * 0.7,
      height * 0.7,
      400,
    );
    grad2.addColorStop(0, color3);
    grad2.addColorStop(1, 'transparent');
    ctx.fillStyle = grad2;
    ctx.fillRect(0, 0, width, height);

    ctx.globalAlpha = 1.0;
  }

  /**
   * Draw wave pattern
   */
  private drawWavePattern(
    ctx: CanvasContext2D,
    width: number,
    height: number,
    color1: string,
    color2: string,
  ): void {
    // Base gradient
    this.drawLinearGradient(ctx, width, height, color1, color2);

    // Draw waves
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
        } else {
          ctx.lineTo(x, waveY);
        }
      }
      ctx.stroke();
    }
  }

  /**
   * Draw title with enhanced styling
   */
  /**
   * Draw title on image background using Canvas transform for reliable scaling
   */
  private drawTitleOnImage(
    ctx: CanvasContext2D,
    width: number,
    height: number,
    title: string,
  ): void {
    // BASE FONT SIZE - This is the base size, will be scaled up
    // Adjust this value to change text size:
    // - 35px = small text (scaled 3.5x = 122px)
    // - 40px = medium text (scaled 3.5x = 140px)
    // - 45px = large text (scaled 3.5x = 157px)
    const BASE_FONT_SIZE = 40; // Base font size (40 × 3.5 = 140px effective)
    const SCALE_FACTOR = 3.5; // Scale factor (3.5x = 140px effective)
    const maxLines = 3;
    const lineHeightRatio = 1.25;

    // Calculate effective font size
    const effectiveFontSize = BASE_FONT_SIZE * SCALE_FACTOR;

    this.logger.log(
      `[COVER] Drawing title "${title}" - Base: ${BASE_FONT_SIZE}px, Scale: ${SCALE_FACTOR}x, Effective: ${effectiveFontSize}px`,
    );

    // Create a temporary canvas to measure text (at base size)
    const tempCanvas = createCanvas(1, 1);
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.font = `bold ${BASE_FONT_SIZE}px "Gravitas One", "Arial Black", Arial, sans-serif`;

    // Wrap text at base size (every 3-4 characters)
    const wrappedTitle = this.wrapText(tempCtx, title);
    const finalWrappedTitle = wrappedTitle.slice(0, maxLines);
    const actualLines = finalWrappedTitle.length;

    // Calculate line height and positioning (at base size)
    const baseLineHeight = BASE_FONT_SIZE * lineHeightRatio;
    const totalTextHeight = (actualLines - 1) * baseLineHeight;
    const baseTitleY = height / SCALE_FACTOR / 2 - totalTextHeight / 2;

    // Save context state
    ctx.save();

    // Scale the entire context to make text larger
    ctx.scale(SCALE_FACTOR, SCALE_FACTOR);

    // Set Gravitas One font (fallback to Arial if not available)
    ctx.font = `bold ${BASE_FONT_SIZE}px "Gravitas One", "Arial Black", Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Draw each line with random color
    finalWrappedTitle.forEach((line, index) => {
      const y = baseTitleY + index * baseLineHeight;
      const centerX = width / SCALE_FACTOR / 2;

      // Generate random color for each line
      const lineColor = this.generateRandomColor();

      // Draw text shadow for better visibility
      ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 2;

      // Draw text stroke for better contrast
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.lineWidth = 1;
      ctx.strokeText(line, centerX, y);

      // Draw main text with random color
      ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
      ctx.shadowBlur = 2;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 1;
      ctx.fillStyle = lineColor;
      ctx.fillText(line, centerX, y);

      // Reset all styles
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      ctx.strokeStyle = 'transparent';
      ctx.lineWidth = 0;
    });

    // Restore context state
    ctx.restore();

    this.logger.log(
      `[COVER] Title drawn - ${actualLines} lines, effective font size: ${effectiveFontSize}px`,
    );
  }

  /**
   * Draw decorative elements based on template
   */
  private drawDecorativeElements(
    ctx: CanvasContext2D,
    width: number,
    height: number,
    colors: { primary: string; secondary: string; accent: string; text: string },
    templateIndex: number,
  ): void {
    ctx.globalAlpha = 0.15;

    switch (templateIndex % 3) {
      case 0:
        // Corner decorations
        this.drawCornerDecorations(ctx, width, height, colors.accent);
        break;
      case 1:
        // Floating shapes
        this.drawFloatingShapes(ctx, width, height, colors.accent);
        break;
      case 2:
        // Grid pattern
        this.drawGridPattern(ctx, width, height, colors.accent);
        break;
    }

    ctx.globalAlpha = 1.0;
  }

  /**
   * Draw corner decorations
   */
  private drawCornerDecorations(
    ctx: CanvasContext2D,
    width: number,
    height: number,
    color: string,
  ): void {
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;

    // Top-left
    ctx.beginPath();
    ctx.moveTo(40, 40);
    ctx.lineTo(120, 40);
    ctx.lineTo(40, 120);
    ctx.stroke();

    // Top-right
    ctx.beginPath();
    ctx.moveTo(width - 40, 40);
    ctx.lineTo(width - 120, 40);
    ctx.lineTo(width - 40, 120);
    ctx.stroke();

    // Bottom-left
    ctx.beginPath();
    ctx.moveTo(40, height - 40);
    ctx.lineTo(120, height - 40);
    ctx.lineTo(40, height - 120);
    ctx.stroke();

    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(width - 40, height - 40);
    ctx.lineTo(width - 120, height - 40);
    ctx.lineTo(width - 40, height - 120);
    ctx.stroke();
  }

  /**
   * Draw floating shapes
   */
  private drawFloatingShapes(
    ctx: CanvasContext2D,
    width: number,
    height: number,
    color: string,
  ): void {
    ctx.fillStyle = color;

    // Circles
    ctx.beginPath();
    ctx.arc(width * 0.15, height * 0.2, 40, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(width * 0.85, height * 0.8, 60, 0, Math.PI * 2);
    ctx.fill();

    // Rectangles
    ctx.fillRect(width * 0.1, height * 0.75, 80, 80);
    ctx.fillRect(width * 0.85, height * 0.15, 70, 70);
  }

  /**
   * Draw grid pattern
   */
  private drawGridPattern(
    ctx: CanvasContext2D,
    width: number,
    height: number,
    color: string,
  ): void {
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    const gridSize = 60;

    // Vertical lines
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Horizontal lines
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  }

  /**
   * Calculate font size based on height (new strategy for massive text)
   */
  private calculateFontSizeForHeight(
    text: string,
    maxWidth: number,
    preferredSize: number,
    maxSize: number,
    minSize: number,
  ): number {
    const canvas = createCanvas(1, 1);
    const ctx = canvas.getContext('2d');

    // Start with preferred size
    let fontSize = preferredSize;
    ctx.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto`;

    // Check if text fits at preferred size
    const textWidth = ctx.measureText(text).width;

    // If text is much shorter than max width, try even larger font
    if (textWidth < maxWidth * 0.4) {
      fontSize = Math.min(maxSize, preferredSize * 1.3);
      ctx.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto`;
      if (ctx.measureText(text).width > maxWidth) {
        fontSize = preferredSize;
        ctx.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto`;
      }
    }

    // Adjust down if text is too wide (but don't go below minSize)
    while (ctx.measureText(text).width > maxWidth && fontSize > minSize) {
      fontSize -= 5; // Larger steps for faster adjustment
      ctx.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto`;
    }

    return Math.max(fontSize, minSize);
  }

  /**
   * Calculate appropriate font size for text
   */
  private calculateFontSize(
    text: string,
    maxWidth: number,
    maxSize: number,
    minSize: number,
  ): number {
    const canvas = createCanvas(1, 1);
    const ctx = canvas.getContext('2d');

    // Start with max size
    let fontSize = maxSize;
    ctx.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto`;

    // Check if text fits at max size
    const textWidth = ctx.measureText(text).width;

    // If text is much shorter than max width, try larger font
    if (textWidth < maxWidth * 0.5) {
      // For short titles, use even larger font (up to 700px)
      fontSize = Math.min(maxSize + 200, 700);
      ctx.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto`;
      // Re-check if larger font still fits
      if (ctx.measureText(text).width > maxWidth) {
        fontSize = maxSize; // Revert if too large
        ctx.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto`;
      }
    }

    // Adjust down if text is too wide
    while (ctx.measureText(text).width > maxWidth && fontSize > minSize) {
      fontSize -= 2;
      ctx.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto`;
    }

    return Math.max(fontSize, minSize);
  }

  /**
   * Wrap text every 3-4 characters (Chinese characters)
   */
  private wrapText(_ctx: CanvasContext2D, text: string): string[] {
    const lines: string[] = [];
    const charsPerLine = 3 + Math.floor(Math.random() * 2); // 3 or 4 characters per line

    // Split text into characters (handles Chinese characters correctly)
    const characters = Array.from(text);

    for (let i = 0; i < characters.length; i += charsPerLine) {
      const line = characters.slice(i, i + charsPerLine).join('');
      if (line.trim()) {
        lines.push(line);
      }
    }

    return lines;
  }

  /**
   * Upload image to Cloudinary
   */
  private async uploadToCloudinary(buffer: Buffer): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'covers',
          resource_type: 'image',
          format: 'png',
          transformation: [{ quality: 'auto' }, { fetch_format: 'auto' }],
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result!.secure_url);
          }
        },
      );

      uploadStream.end(buffer);
    });
  }

  /**
   * Save image locally (for development)
   */
  private async saveLocally(buffer: Buffer): Promise<string> {
    const fs = await import('fs/promises');
    const path = await import('path');

    // Create covers directory if it doesn't exist
    const coversDir = path.join(process.cwd(), 'public', 'covers');
    try {
      await fs.access(coversDir);
    } catch {
      await fs.mkdir(coversDir, { recursive: true });
    }

    // Generate filename
    const filename = `cover_${Date.now()}.png`;
    const filepath = path.join(coversDir, filename);

    // Save file
    await fs.writeFile(filepath, buffer);

    // Return URL path (static files are served at root, not under /api)
    // In production with Vercel, this won't work, so use Cloudinary
    const baseUrl = this.configService.get<string>('BASE_URL') || 'http://localhost:3000';
    return `${baseUrl}/covers/${filename}`;
  }

  /**
   * Extract font size from font string (e.g., "bold 500px Arial" -> 500)
   */
  private extractFontSize(fontString: string): number {
    const match = fontString.match(/(\d+)px/);
    return match ? parseInt(match[1], 10) : 0;
  }
}
