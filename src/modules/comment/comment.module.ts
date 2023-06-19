import { Module, forwardRef } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { UserModule } from '../user/user.module';
import { CommentRepository } from './comment.repository';
import { PostModule } from '../post/post.module';

@Module({
  controllers: [CommentController],
  providers: [CommentService, CommentRepository],
  imports: [UserModule, forwardRef(() => PostModule)],
  exports: [CommentService],
})
export class CommentModule {}
