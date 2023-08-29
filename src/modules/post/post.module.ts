import { Module, forwardRef } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { UserModule } from '../user/user.module';
import { PostRepository } from './post.repository';
import { CommentModule } from '../comment/comment.module';
import { CacheModule } from '@nestjs/cache-manager';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  controllers: [PostController],
  providers: [PostService, PostRepository],
  exports: [PostService],
  imports: [
    ClientsModule.register([
      {
        name: 'HELLO_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'],
          queue: 'notification_queue',
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
    UserModule,
    forwardRef(() => CommentModule),
    CacheModule.register(),
  ],
})
export class PostModule {}
