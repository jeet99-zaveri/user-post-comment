import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MinLength } from 'class-validator';

export class CreatePostDto {
  @ApiProperty({
    description: 'Title of the post',
    example: 'The sun',
  })
  @IsNotEmpty()
  @MinLength(3)
  title: string;
}
