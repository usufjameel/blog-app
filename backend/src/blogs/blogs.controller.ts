import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { BlogsService } from './blogs.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { FirebaseAuthGuard } from '../common/guards/firebase-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('blogs')
@Controller('blogs')
export class BlogsController {
  constructor(private readonly blogsService: BlogsService) {}

  @Post()
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new blog' })
  create(@Body() createBlogDto: CreateBlogDto, @CurrentUser() user: any) {
    return this.blogsService.create(createBlogDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all blogs with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'tag', required: false, type: String })
  @ApiQuery({ name: 'author', required: false, type: String })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('category') category?: string,
    @Query('tag') tag?: string,
    @Query('author') author?: string,
  ) {
    return this.blogsService.findAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      category,
      tag,
      author,
    );
  }

  @Get('popular')
  @ApiOperation({ summary: 'Get popular blogs' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findPopular(@Query('limit') limit?: string) {
    return this.blogsService.findPopular(limit ? parseInt(limit) : 10);
  }

  @Get('id/:id')
  @ApiOperation({ summary: 'Get a blog by ID' })
  findById(@Param('id') id: string, @CurrentUser() user?: any) {
    return this.blogsService.findById(id, user?.id);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get a blog by slug' })
  findOne(@Param('slug') slug: string, @CurrentUser() user?: any) {
    return this.blogsService.findOne(slug, user?.id);
  }

  @Patch(':id')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a blog' })
  update(@Param('id') id: string, @Body() updateBlogDto: UpdateBlogDto, @CurrentUser() user: any) {
    return this.blogsService.update(id, updateBlogDto, user.id);
  }

  @Delete(':id')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a blog' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.blogsService.remove(id, user.id);
  }

  @Post(':id/like')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle like on a blog' })
  toggleLike(@Param('id') id: string, @CurrentUser() user: any) {
    return this.blogsService.toggleLike(id, user.id);
  }
}