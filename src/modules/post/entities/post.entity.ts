import { ApiProperty } from '@nestjs/swagger';
import { Comment } from 'src/modules/comment/entities/comment.entity';
import { User } from 'src/modules/user/entities/user.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export class Post extends BaseEntity {
  @ApiProperty({ description: 'Primary key as Post ID', example: 1 })
  @PrimaryGeneratedColumn({ comment: 'The post unique identifier' })
  id: number;

  @ApiProperty({
    description: 'Title of the post',
    example: 'Sample nest post',
  })
  @Column()
  title: string;

  @ApiProperty({
    description: 'File Path of post',
    example: 'Lorem ipsum',
  })
  @Column()
  filePath: string;

  @ApiProperty({ description: 'When user was created.' })
  @CreateDateColumn()
  createdAt!: Date;

  @ApiProperty({ description: 'When user was updated.' })
  @UpdateDateColumn()
  updatedAt!: Date;

  @ApiProperty({ description: 'When user was deleted.' })
  @DeleteDateColumn()
  deletedAt?: Date;

  @ApiProperty({ description: 'Post of the user' })
  @ManyToOne(() => User, (user) => user.posts)
  postBy: User;

  @ApiProperty({ description: 'List of comments' })
  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];
}
