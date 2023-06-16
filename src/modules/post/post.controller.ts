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

@ApiTags('Posts')
@Controller('post')
@ApiSecurity('bearer')
@UseGuards(JwtAuthGuard)
export class PostController {
  constructor(private readonly postService: PostService) {}

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
    return await this.postService.create(file, createPostDto, req);
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
  async findOne(@Param('id') id: string, @Request() req) {
    const post = await this.postService.findOne(+id);
    if (post) {
      if (req.user.role !== ROLES.ADMIN && req.user.id !== post.postedBy.id) {
        throw new UnauthorizedException("You're not allow to get this post.");
      }

      return post;
    } else {
      throw new NotFoundException('Post is not found.');
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
    @Request() req,
  ) {
    const post = await this.postService.findOne(+id);
    if (post) {
      if (req.user.role !== ROLES.ADMIN && req.user.id !== post.postedBy.id) {
        throw new UnauthorizedException(
          "You're not allow to update this post.",
        );
      }
    } else {
      throw new NotFoundException('Post is not found.');
    }

    return this.postService.update(post, updatePostDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    const post = await this.postService.findOne(+id);
    if (post) {
      if (req.user.role !== ROLES.ADMIN && req.user.id !== post.postedBy.id) {
        throw new UnauthorizedException(
          "You're not allow to update this post.",
        );
      }
    } else {
      throw new NotFoundException('Post is not found.');
    }

    await post.softRemove();

    return { status: HttpStatus.OK, message: 'Post deleted successfully.' };
  }
}
