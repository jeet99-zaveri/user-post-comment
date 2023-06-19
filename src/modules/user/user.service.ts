import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import {
  IPaginationOptions,
  Pagination,
  paginate,
} from 'nestjs-typeorm-paginate';
import { UserRepository } from './user.repository';
import { ROLES } from './enums/user.enum';
import { Not } from 'typeorm';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async paginate(options: IPaginationOptions): Promise<Pagination<User>> {
    const qb = this.userRepository
      .createQueryBuilder('u')
      .where({ role: Not(ROLES.ADMIN) })
      .leftJoin('u.posts', 'p')
      .leftJoin('p.comments', 'c')
      .leftJoin('c.commentBy', 'cb')
      .select([
        'u.id',
        'u.name',
        'p.id',
        'p.title',
        'c.id',
        'c.comment',
        'cb.id',
        'cb.name',
      ])
      .orderBy('u.id', 'DESC');

    return paginate<User>(qb, options);
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository
      .createQueryBuilder('u')
      .where({ id, role: Not(ROLES.ADMIN) })
      .leftJoin('u.posts', 'p')
      .leftJoin('p.comments', 'c')
      .leftJoin('c.commentBy', 'cb')
      .select([
        'u.id',
        'u.name',
        'p.id',
        'p.title',
        'c.id',
        'c.comment',
        'cb.id',
        'cb.name',
      ])
      .getOne();

    if (!user) {
      throw new NotFoundException('User is not found.');
    }

    return user;
  }

  async getUser(id: number): Promise<User | undefined> {
    return User.findOne({ where: { id } });
  }

  async update(user: User, updateUserDto: UpdateUserDto) {
    return (
      (
        await this.userRepository
          .createQueryBuilder()
          .update(User, updateUserDto)
          .where('id = :id', { id: user.id })
          .returning(['id', 'email', 'name'])
          .updateEntity(true)
          .execute()
      ).raw[0] ?? null
    );
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return User.findOne({ where: { email } });
  }
}
