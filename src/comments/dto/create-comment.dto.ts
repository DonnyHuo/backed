import { IsString, IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({ description: 'The content of the comment' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ description: 'The ID of the post to comment on' })
  @IsString()
  @IsNotEmpty()
  postId: string;
}
