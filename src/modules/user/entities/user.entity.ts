import { ApiProperty } from '@nestjs/swagger';
import * as bcrypt from 'bcrypt';
import {
  BaseEntity,
  BeforeInsert,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserRoles } from '../enums/user.enum';
import { Post } from 'src/modules/post/entities/post.entity';
import { Comment } from 'src/modules/comment/entities/comment.entity';

@Entity({ name: 'users' })
export class User extends BaseEntity {
  @ApiProperty({ description: 'Primary key as User ID', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: "User's name",
    example: 'Jeet Zaveri',
  })
  @Column()
  name: string;

  @ApiProperty({
    description: 'User email address',
    example: 'jeet@gmail.com',
  })
  @Column({
    unique: true,
  })
  email: string;

  @ApiProperty({ description: 'Hashed user password.' })
  @Column()
  password: string;

  @Column({ type: 'enum', enum: UserRoles, default: UserRoles.USER })
  role: UserRoles;

  @ApiProperty({ description: 'When user was created.' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'When user was updated.' })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({ description: 'When user was deleted.' })
  @DeleteDateColumn()
  deletedAt?: Date;

  @ApiProperty({ description: 'List of posts' })
  @OneToMany(() => Post, (post) => post.postBy)
  posts: Post[];

  @ApiProperty({ description: 'List of comments' })
  @OneToMany(() => Comment, (comment) => comment.commentBy)
  comments: Comment[];

  @BeforeInsert()
  async setPassword(password: string) {
    const salt = await bcrypt.genSalt();
    this.password = bcrypt.hashSync(password || this.password, salt);
  }
}
