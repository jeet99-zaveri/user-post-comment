import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MinLength } from 'class-validator';

export class UpdateCommentDto {
  @ApiProperty({
    description: 'Comment of the post',
    example: 'Superb',
  })
  @IsNotEmpty()
  @MinLength(3)
  comment?: string;
}
