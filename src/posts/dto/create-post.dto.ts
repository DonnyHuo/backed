import { IsString, IsOptional, IsBoolean, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty({ example: 'My First Post', description: 'Post title' })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional({ example: 'This is the content of my post...', description: 'Post content' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ example: false, description: 'Whether the post is published' })
  @IsOptional()
  @IsBoolean()
  published?: boolean;
}

