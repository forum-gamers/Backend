import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
  type NestMiddleware,
} from '@nestjs/common';
import type { RequestHandler } from 'express';
import { CommunityService } from 'src/modules/community/community.service';

/**
 * @info
 * @description
 * always bring community 'id' on request params except create
 */
@Injectable()
export class CommunityAccessMiddleware implements NestMiddleware {
  public use: RequestHandler = async (req, res, next) => {
    const { id } = req.params;

    const value = parseInt(id);
    if (isNaN(value)) throw new BadRequestException('id must be a number');

    const { id: userId } = req.user;
    if (!userId)
      throw new InternalServerErrorException(
        'route not provided for anonymous user',
      );
    const community = await this.communityService.findByIdAndFindMe(
      value,
      userId,
    );
    if (!community) throw new NotFoundException('community not found');

    if (community?.dataValues) req.community = community.dataValues;
    if (community?.members?.length)
      req.communityMember = community.members.find(
        (el) => el.userId === userId,
      )?.dataValues;

    if (req.method === 'GET') return next();

    if (!community.members?.length)
      throw new UnauthorizedException('unauthorized');

    next();
  };

  constructor(private readonly communityService: CommunityService) {}
}
