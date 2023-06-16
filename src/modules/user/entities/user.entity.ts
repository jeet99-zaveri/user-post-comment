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
import { ROLES } from '../enums/user.enum';
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

  @Column({ type: 'enum', enum: ROLES, default: ROLES.USER })
  role: ROLES;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  @OneToMany(() => Post, (post) => post.postedBy)
  posts: Post[];

  @OneToMany(() => Comment, (comment) => comment.commentBy)
  comments: Comment[];

  @BeforeInsert()
  async setPassword(password: string) {
    const salt = await bcrypt.genSalt();
    this.password = bcrypt.hashSync(password || this.password, salt);
  }
}
