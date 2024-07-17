import {
  BadRequestException,
  ConflictException,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { BaseController } from 'src/base/controller.base';
import { FollowService } from './follow.service';
import { UserMe } from '../user/decorators/me.decorator';
import { CreateFollowDto } from './dto/create.dto';
import { QueryParamsDto } from 'src/utils/dto/pagination.dto';
import { FollowValidation } from './follow.validation';

@Controller('follow')
export class FollowController extends BaseController {
  constructor(
    private readonly followService: FollowService,
    private readonly followValidation: FollowValidation,
  ) {
    super();
  }

  @Post(':id')
  @HttpCode(201)
  public async follow(@Param('id') id: string, @UserMe('id') userId: string) {
    if (id === userId)
      throw new ForbiddenException('you can not follow yourself');

    if (await this.followService.findOne(userId, id))
      throw new ConflictException('you already follow this user');

    return this.sendResponseBody({
      message: 'follow success',
      code: 201,
      data: await this.followService.create(
        new CreateFollowDto({ followerId: userId, followedId: id }),
      ),
    });
  }

  @Delete(':id')
  @HttpCode(200)
  public async unfollow(@Param('id') id: string, @UserMe('id') userId: string) {
    if (id === userId)
      throw new ForbiddenException('you can not unfollow yourself');

    if (!(await this.followService.findOne(userId, id)))
      throw new BadRequestException('you did not follow this user');

    await this.followService.deleteOne(
      new CreateFollowDto({ followerId: userId, followedId: id }),
    );

    return this.sendResponseBody({
      message: 'unfollow success',
      code: 200,
    });
  }

  @Get()
  @HttpCode(200)
  public async getMyFollowers(
    @UserMe('id') userId: string,
    @Query() query: QueryParamsDto,
  ) {
    const {
      page = 1,
      limit = 15,
      sortDirection = 'DESC',
      sortby = 'createdAt',
    } = await this.followValidation.validatePagination(query);

    return this.sendResponseBody({
      message: 'get followers success',
      code: 200,
      data: await this.followService.getFollowers(userId, {
        page,
        limit,
        sortDirection,
        sortby,
      }),
    });
  }

  @Get('following')
  @HttpCode(200)
  public async getMyFollowing(
    @UserMe('id') userId: string,
    @Query() query: QueryParamsDto,
  ) {
    const {
      page = 1,
      limit = 15,
      sortDirection = 'DESC',
      sortby = 'createdAt',
    } = await this.followValidation.validatePagination(query);

    return this.sendResponseBody({
      message: 'get following success',
      code: 200,
      data: await this.followService.getMyFollowings(userId, {
        page,
        limit,
        sortDirection,
        sortby,
      }),
    });
  }
}
