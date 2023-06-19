import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentRepository } from './comment.repository';
import {
  IPaginationOptions,
  Pagination,
  paginate,
} from 'nestjs-typeorm-paginate';
import { Comment } from './entities/comment.entity';

@Injectable()
export class CommentService {
  constructor(private readonly commentRepository: CommentRepository) {}

  async paginate(options: IPaginationOptions): Promise<Pagination<Comment>> {
    const qb = this.commentRepository
      .createQueryBuilder('c')
      .leftJoin('c.post', 'p')
      .leftJoin('p.postedBy', 'pb')
      .leftJoin('c.commentBy', 'cb')
      .select([
        'c.id',
        'c.comment',
        'p.id',
        'p.title',
        'p.filePath',
        'p.postedBy',
        'pb.id',
        'pb.name',
        'cb.id',
        'cb.name',
      ])
      .orderBy('c.id', 'DESC');

    return paginate<Comment>(qb, options);
  }

  async findOne(id: number): Promise<Comment> {
    const comment = await this.commentRepository
      .createQueryBuilder('c')
      .where({ id })
      .leftJoin('c.post', 'p')
      .leftJoin('p.postedBy', 'pb')
      .leftJoin('c.commentBy', 'cb')
      .select([
        'c.id',
        'c.comment',
        'p.id',
        'p.title',
        'p.filePath',
        'p.postedBy',
        'pb.id',
        'pb.name',
        'cb.id',
        'cb.name',
      ])
      .getOne();

    if (!comment) {
      throw new NotFoundException('Comment is not found.');
    }

    return comment;
  }

  async update(comment: Comment, updateCommentDto: UpdateCommentDto) {
    return (
      (
        await this.commentRepository
          .createQueryBuilder()
          .update(Comment, updateCommentDto)
          .where('id = :id', { id: comment.id })
          .returning(['id', 'comment', 'commentBy'])
          .updateEntity(true)
          .execute()
      ).raw[0] ?? null
    );
  }

  async removeCommentsOfPost(post: number) {
    return await this.commentRepository
      .createQueryBuilder()
      .where('post = :post', { post })
      .softDelete()
      .execute();
  }
}
