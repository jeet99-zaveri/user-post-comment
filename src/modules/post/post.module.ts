import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { UserModule } from '../user/user.module';
import { PostRepository } from './post.repository';

@Module({
  controllers: [PostController],
  providers: [PostService, PostRepository],
  imports: [UserModule],
})
export class PostModule {}
