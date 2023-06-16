import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { User } from './entities/user.entity';
import { SETTINGS } from 'src/app.utils';
import { JwtAuthGuard } from '../auth/jwt.auth.guard';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiCreatedResponse({
    description: 'Created user object as response.',
    type: User,
  })
  @ApiBadRequestResponse({
    description: 'User is not registered. Try again..!',
  })
  @Post('register')
  async create(
    @Body(SETTINGS.VALIDATION_PIPE) createUserDto: CreateUserDto,
  ): Promise<User> {
    return await this.userService.create(createUserDto);
  }

  @Get()
  @ApiSecurity('bearer')
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  @ApiSecurity('bearer')
  @UseGuards(JwtAuthGuard)
  findOneById(@Param('id') id: string) {
    return this.userService.findOneById(+id);
  }

  @Patch(':id')
  @ApiSecurity('bearer')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  @ApiSecurity('bearer')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
