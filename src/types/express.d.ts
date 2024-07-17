import type { CommunityAttributes } from 'src/models/community';
import type { AdminAttributes } from '../models/admin';
import type { UserAttributes } from '../models/user';
import type { CommunityMembersAttributes } from 'src/models/communitymember';

export declare global {
  namespace Express {
    interface Request {
      user?: UserAttributes;
      admin?: AdminAttributes;
      community?: CommunityAttributes;
      communityMember?: CommunityMembersAttributes;
    }
  }
}
