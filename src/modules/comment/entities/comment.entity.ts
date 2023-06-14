import { ApiProperty } from '@nestjs/swagger';
import { Post } from 'src/modules/post/entities/post.entity';
import { User } from 'src/modules/user/entities/user.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export class Comment extends BaseEntity {
  @ApiProperty({ description: 'Primary key as Comment ID', example: 1 })
  @PrimaryGeneratedColumn({ comment: 'The comment unique identifier' })
  id: number;

  @ApiProperty({
    description: 'Comment of the post',
    example: 'Sample nest comment',
  })
  @Column()
  comment: string;

  @ApiProperty({ description: 'When user was created.' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'When user was updated.' })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({ description: 'When user was deleted.' })
  @DeleteDateColumn()
  deletedAt?: Date;

  @ApiProperty({ description: 'Comment of the post' })
  @ManyToOne(() => Post, (post) => post.comments)
  post: Post;

  @ApiProperty({ description: 'Comment of the post' })
  @ManyToOne(() => User, (user) => user.comments)
  commentBy: User;
}
