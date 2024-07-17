import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';
import type { Request } from 'express';

export const CommunityContext = createParamDecorator(
  (key: 'community' | 'communityMember', ctx: ExecutionContext) => {
    const { community, communityMember } = ctx
      .switchToHttp()
      .getRequest<Request>();

    if (!community || !communityMember)
      throw new InternalServerErrorException(
        'you must use this decorator on authenticated community endpoint',
      );

    let result: Record<'community' | 'communityMember', any> = {
      community,
      communityMember,
    };

    if (key && ['community', 'communityMember'].includes(key))
      result = result[key];

    return result;
  },
);
