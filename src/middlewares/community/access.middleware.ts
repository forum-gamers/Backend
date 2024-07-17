import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
  type NestMiddleware,
} from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';
import { CommunityService } from 'src/modules/community/community.service';

/**
 * @info
 * @description
 * always bring community 'id' on request params except create
 */
@Injectable()
export class CommunityAccessMiddleware implements NestMiddleware {
  public async use(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;

    const value = parseInt(id);
    if (isNaN(value)) throw new BadRequestException('id must be a number');

    const { id: userId } = req?.user;
    if (!userId)
      throw new InternalServerErrorException(
        'route not provided for anonymous user',
      );

    const community = await this.communityService.findByIdAndFindMe(
      value,
      userId,
    );
    if (!community) throw new NotFoundException('community not found');

    if (!community.members?.length)
      throw new UnauthorizedException('you have not access');

    req.community = community.dataValues;
    req.communityMember = community.members[0].dataValues;

    next();
  }

  constructor(private readonly communityService: CommunityService) {}
}
