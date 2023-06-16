import { Repository, DataSource } from 'typeorm';
import { Post } from './entities/post.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PostRepository extends Repository<Post> {
  constructor(private dataSource: DataSource) {
    super(Post, dataSource.createEntityManager());
  }
}
