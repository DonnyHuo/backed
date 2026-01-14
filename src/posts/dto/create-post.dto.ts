import { IsString, IsOptional, IsBoolean, MaxLength, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty({ example: 'My First Post', description: 'Post title' })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional({
    example: 'This is the content of my post...',
    description: 'Post content',
  })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ example: false, description: 'Whether the post is published' })
  @IsOptional()
  @IsBoolean()
  published?: boolean;

  @ApiPropertyOptional({
    example: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
    description: 'Custom cover image URLs (optional, will auto-generate one if not provided)',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  coverUrls?: string[];
}
