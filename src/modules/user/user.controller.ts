import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  HttpException,
  HttpStatus,
  Request,
  UnauthorizedException,
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
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorators';
import { ApiPaginatedResponse } from 'src/common/decorators/api.pagination.response';
import { IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';
import { ROLES } from './enums/user.enum';

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
    if (createUserDto.password !== createUserDto.confirmPassword) {
      throw new HttpException(
        'Confirm Password does not match with Password.',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const newUser = new User();
    newUser.name = createUserDto.name;
    newUser.email = createUserDto.email;
    newUser.password = createUserDto.password;

    return await newUser.save();
  }

  @ApiPaginatedResponse({ model: User, description: 'List of users.' })
  @Get()
  @ApiSecurity('bearer')
  @UsePipes(ValidationPipe)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit = 10,
  ): Promise<Pagination<User>> {
    const options: IPaginationOptions = { page, limit };

    return await this.userService.paginate(options);
  }

  @Get(':id')
  @ApiSecurity('bearer')
  @UsePipes(ValidationPipe)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'admin')
  async findOne(@Param('id') id: string, @Request() req) {
    const user = await this.userService.findOne(+id);

    if (req.user.role !== ROLES.ADMIN && req.user.id !== user.id) {
      throw new UnauthorizedException("You're not allow to access this route.");
    }

    return user;
  }

  @Patch(':id')
  @ApiSecurity('bearer')
  @UsePipes(ValidationPipe)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'admin')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req,
  ) {
    const user = await this.userService.findOne(+id);

    if (req.user.role !== ROLES.ADMIN && req.user.id !== user.id) {
      throw new UnauthorizedException("You're not allow to access this route.");
    }

    return this.userService.update(user, updateUserDto);
  }

  @Delete(':id')
  @ApiSecurity('bearer')
  @UsePipes(ValidationPipe)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async remove(@Param('id') id: string) {
    const user = await this.userService.findOne(+id);

    await user.softRemove();

    return { status: HttpStatus.OK, message: 'User deleted successfully.' };
  }
}
