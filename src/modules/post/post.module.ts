import { Module, forwardRef } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { UserModule } from '../user/user.module';
import { PostRepository } from './post.repository';
import { CommentModule } from '../comment/comment.module';

@Module({
  controllers: [PostController],
  providers: [PostService, PostRepository],
  exports: [PostService],
  imports: [UserModule, forwardRef(() => CommentModule)],
})
export class PostModule {}
