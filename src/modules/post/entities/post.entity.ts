import { ApiProperty } from '@nestjs/swagger';
import { Comment } from 'src/modules/comment/entities/comment.entity';
import { User } from 'src/modules/user/entities/user.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'posts' })
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

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  @ApiProperty({ description: 'Owner of the post' })
  @ManyToOne(() => User, (user) => user.posts)
  postedBy: User;

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];
}
