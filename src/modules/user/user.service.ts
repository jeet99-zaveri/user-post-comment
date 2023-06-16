import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  async create(createUserDto: CreateUserDto): Promise<User> {
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

  findAll() {
    return `This action returns all user`;
  }

  async findOneById(id: number): Promise<User | undefined> {
    return User.findOne({ where: { id } });
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return User.findOne({ where: { email } });
  }
}
