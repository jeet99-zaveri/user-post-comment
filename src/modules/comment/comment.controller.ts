import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Request,
  NotFoundException,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  UnauthorizedException,
  HttpStatus,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { ApiCreatedResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt.auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorators';
import { Comment } from './entities/comment.entity';
import { PostService } from '../post/post.service';
import { ApiPaginatedResponse } from 'src/common/decorators/api.pagination.response';
import { IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';
import { ROLES } from '../user/enums/user.enum';

@ApiTags('Comments')
@ApiSecurity('bearer')
@Controller('comment')
@UseGuards(JwtAuthGuard)
export class CommentController {
  constructor(
    private readonly commentService: CommentService,
    private readonly postService: PostService,
  ) {}

  @ApiCreatedResponse()
  @Post()
  @UsePipes(ValidationPipe)
  @UseGuards(RolesGuard)
  @Roles('user', 'admin')
  async create(@Body() createCommentDto: CreateCommentDto, @Request() req) {
    const post = await this.postService.findOne(createCommentDto.postId);
    if (!post) {
      throw new NotFoundException('Post is not found.');
    }

    const commentPayload = new Comment();
    commentPayload.comment = createCommentDto.comment;
    commentPayload.post = post;
    commentPayload.commentBy = req.user.id;

    return await commentPayload.save();
  }

  @ApiPaginatedResponse({ model: Comment, description: 'List of comments.' })
  @Get()
  @UsePipes(ValidationPipe)
  @UseGuards(RolesGuard)
  @Roles('user', 'admin')
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit = 10,
  ): Promise<Pagination<Comment>> {
    const options: IPaginationOptions = { page, limit };

    return await this.commentService.paginate(options);
  }

  @Get(':id')
  @UsePipes(ValidationPipe)
  @UseGuards(RolesGuard)
  @Roles('user', 'admin')
  async findOne(@Param('id') id: string) {
    return await this.commentService.findOne(+id);
  }

  @Patch(':id')
  @UsePipes(ValidationPipe)
  @UseGuards(RolesGuard)
  @Roles('user', 'admin')
  async update(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @Request() req,
  ) {
    const comment = await this.commentService.findOne(+id);

    if (req.user.id !== comment.commentBy.id) {
      throw new UnauthorizedException(
        "You're not allow to update this comment.",
      );
    }

    return this.commentService.update(comment, updateCommentDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    const comment = await this.commentService.findOne(+id);

    if (
      req.user.role !== ROLES.ADMIN &&
      req.user.id !== (comment.commentBy.id || comment.post.postedBy)
    ) {
      throw new UnauthorizedException(
        "You're not allow to delete this comment.",
      );
    }

    await comment.softRemove();

    return { status: HttpStatus.OK, message: 'Comment deleted successfully.' };
  }
}
