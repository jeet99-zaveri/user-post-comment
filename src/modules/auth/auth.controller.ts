import {
  Body,
  Controller,
  Post,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local.auth.guard';
import { LoginDto } from './dto/login.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOkResponse({
    schema: {
      example: {
        access_token: 'string',
      },
    },
  })
  @Post('login')
  @UsePipes(ValidationPipe)
  @UseGuards(LocalAuthGuard)
  async login(@Request() req, @Body() loginDto: LoginDto): Promise<any> {
    return this.authService.generateToken(req.user);
  }
}
