import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  UnauthorizedException,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ApiCreatedResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express/multer';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Roles } from '../auth/roles.decorators';
import { RolesGuard } from '../auth/roles.guard';
import { JwtAuthGuard } from '../auth/jwt.auth.guard';
import { Post as Posts } from './entities/post.entity';
import { ApiPaginatedResponse } from 'src/common/decorators/api.pagination.response';
import { IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';
import { ROLES } from '../user/enums/user.enum';
import { HttpStatus } from '@nestjs/common';
import { CommentService } from '../comment/comment.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ClientProxy, RmqRecordBuilder } from '@nestjs/microservices';

@ApiTags('Posts')
@Controller('post')
@ApiSecurity('bearer')
@UseGuards(JwtAuthGuard)
export class PostController {
  constructor(
    private readonly postService: PostService,
    private readonly commentService: CommentService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    @Inject('HELLO_SERVICE') private readonly client: ClientProxy,
  ) {}

  @ApiCreatedResponse()
  @Post()
  @UsePipes(ValidationPipe)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const filename = `${uniqueSuffix}${ext}`;
          callback(null, filename);
        },
      }),
    }),
  )
  @UseGuards(RolesGuard)
  @Roles('user', 'admin')
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createPostDto: CreatePostDto,
    @Request() req,
  ): Promise<Posts> {
    const postPayload = new Posts();
    postPayload.title = createPostDto.title;
    postPayload.filePath = file.path;
    postPayload.postedBy = req.user.id;

    return await postPayload.save();
  }

  @ApiPaginatedResponse({ model: Posts, description: 'List of posts.' })
  @Get()
  @UsePipes(ValidationPipe)
  @UseGuards(RolesGuard)
  @Roles('user', 'admin')
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit = 10,
  ): Promise<Pagination<Posts>> {
    const options: IPaginationOptions = { page, limit };

    return await this.postService.paginate(options);
  }

  @Get(':id')
  @UsePipes(ValidationPipe)
  @UseGuards(RolesGuard)
  @Roles('user', 'admin')
  async findOne(@Param('id') id: string) {
    const message = ':cat:';
    const record = new RmqRecordBuilder(message)
      .setOptions({
        headers: {
          ['x-version']: '1.0.0',
        },
        priority: 3,
      })
      .build();
    this.client.send('send_notification', record).subscribe();
    return await this.postService.findOne(+id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
    @Request() req,
  ) {
    const post = await this.postService.findOne(+id);

    if (req.user.role !== ROLES.ADMIN && req.user.id !== post.postedBy.id) {
      throw new UnauthorizedException("You're not allow to update this post.");
    }

    return this.postService.update(post, updatePostDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    const post = await this.postService.findOne(+id);

    if (req.user.role !== ROLES.ADMIN && req.user.id !== post.postedBy.id) {
      throw new UnauthorizedException("You're not allow to update this post.");
    }

    await this.commentService.removeCommentsOfPost(post.id);
    await post.softRemove();

    return { status: HttpStatus.OK, message: 'Post deleted successfully.' };
  }

  @Get('/redisPost/:postId')
  async getPost(@Param('postId') postId) {
    const cachedData = await this.cacheManager.get(`${postId.toString()} Post`);
    if (cachedData) {
      console.log('Getting data from cache', cachedData);
      return { status: HttpStatus.OK, data: cachedData };
    }

    const post = await this.postService.findOne(postId);
    if (!post) throw new NotFoundException('Post does not exist');

    await this.cacheManager.set(`${postId.toString()} Post`, post);
    console.log('postId.toString() :::::::::::::: ', postId.toString(), post);

    const newCachedData = await this.cacheManager.get(
      `${postId.toString()} Post`,
    );
    console.log('data set to cache', newCachedData);

    return { status: HttpStatus.OK, data: post };
  }
}
