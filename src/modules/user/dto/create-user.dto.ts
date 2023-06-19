import {
  IsEmail,
  IsNotEmpty,
  Length,
  Matches,
  MinLength,
} from 'class-validator';
import { MESSAGES, REGEX } from '../../../app.utils';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'The name of the user',
    example: 'Jeet Zaveri',
  })
  @IsNotEmpty()
  @MinLength(3)
  name: string;

  @ApiProperty({
    description: 'The email address of the user',
    example: 'jeet@gmail.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'The password of the user',
    example: 'Password@123',
  })
  @IsNotEmpty()
  @Length(8, 24)
  @Matches(REGEX.PASSWORD_RULE, { message: MESSAGES.PASSWORD_RULE_MESSAGE })
  password: string;

  @ApiProperty({
    description: 'Confirm the password',
    example: 'Password@123',
  })
  @IsNotEmpty()
  @Length(8, 24)
  confirmPassword: string;
}
