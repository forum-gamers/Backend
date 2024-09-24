import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';
import type { Request } from 'express';

export type CommunityContextKey = 'community' | 'communityMember';

export const CommunityContext = createParamDecorator(
  (key: CommunityContextKey, ctx: ExecutionContext) => {
    const { community, communityMember } = ctx
      .switchToHttp()
      .getRequest<Request>();

    if (!community)
      throw new InternalServerErrorException(
        'you must use this decorator on authenticated community endpoint',
      );

    let result: Record<CommunityContextKey, any> = {
      community,
      communityMember,
    };

    if (key && ['community', 'communityMember'].includes(key))
      result = result[key];

    return result;
  },
);
