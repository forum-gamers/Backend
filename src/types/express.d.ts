import type { CommunityAttributes } from 'src/models/community';
import type { AdminAttributes } from '../models/admin';
import type { UserAttributes } from '../models/user';
import type { CommunityMembersAttributes } from 'src/models/communitymember';
import type { RoomChatAttributes } from 'src/models/roomchat';
import type { RoomMemberAttributes } from 'src/models/roommember';
import type { ChatCtxDto } from 'src/modules/chat/dto/chatCtx.dto';

export declare global {
  namespace Express {
    interface Request {
      user?: UserAttributes;
      admin?: AdminAttributes;
      community?: CommunityAttributes;
      communityMember?: CommunityMembersAttributes;
      roomChat?: RoomChatAttributes;
      roomMember?: RoomMemberAttributes;
      chatCtx?: ChatCtxDto;
      admin?: AdminAttributes;
    }
  }
}
