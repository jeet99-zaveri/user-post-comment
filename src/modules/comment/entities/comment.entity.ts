import { ApiProperty } from '@nestjs/swagger';
import { Post } from 'src/modules/post/entities/post.entity';
import { User } from 'src/modules/user/entities/user.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'comments' })
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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  @ApiProperty({ description: 'Post of the comment' })
  @ManyToOne(() => Post, (post) => post.comments)
  post: Post;

  @ApiProperty({ description: 'Owner of the comment' })
  @ManyToOne(() => User, (user) => user.comments)
  commentBy: User;
}
