import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MinLength } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({
    description: 'Comment of the post',
    example: 'Superb',
  })
  @IsNotEmpty()
  @MinLength(3)
  comment: string;

  @ApiProperty({
    description: 'Post Id on which you have to comment',
    example: 1,
  })
  @IsNotEmpty()
  postId: number;
}
