import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './entities/post.entity';
import {
  IPaginationOptions,
  Pagination,
  paginate,
} from 'nestjs-typeorm-paginate';
import { PostRepository } from './post.repository';

@Injectable()
export class PostService {
  constructor(private readonly postRepository: PostRepository) {}

  async paginate(options: IPaginationOptions): Promise<Pagination<Post>> {
    const qb = this.postRepository
      .createQueryBuilder('p')
      .leftJoin('p.postedBy', 'pb')
      .leftJoin('p.comments', 'cm')
      .leftJoin('cm.commentBy', 'cb')
      .select([
        'p.id',
        'p.title',
        'p.filePath',
        'pb.id',
        'pb.name',
        'cm.id',
        'cm.comment',
        'cb.id',
        'cb.name',
      ])
      .orderBy('p.id', 'DESC');

    return paginate<Post>(qb, options);
  }

  async findOne(id: number): Promise<Post> {
    const post = await this.postRepository
      .createQueryBuilder('p')
      .where({ id })
      .leftJoin('p.postedBy', 'pb')
      .leftJoin('p.comments', 'cm')
      .leftJoin('cm.commentBy', 'cb')
      .select([
        'p.id',
        'p.title',
        'p.filePath',
        'pb.id',
        'pb.name',
        'cm.id',
        'cm.comment',
        'cb.id',
        'cb.name',
      ])
      .getOne();

    if (!post) {
      throw new NotFoundException('Post is not found.');
    }

    return post;
  }

  async update(post: Post, updatePostDto: UpdatePostDto) {
    return (
      (
        await this.postRepository
          .createQueryBuilder()
          .update(Post, updatePostDto)
          .where('id = :id', { id: post.id })
          .returning(['id', 'title', 'filePath'])
          .updateEntity(true)
          .execute()
      ).raw[0] ?? null
    );
  }
}
