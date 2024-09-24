import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import {
  CommunityMembers,
  type CommunityMembersAttributes,
} from 'src/models/communitymember';
import { DestroyOptions, FindOptions, type CreateOptions } from 'sequelize';
import { CreateCommunityMemberDto } from './dto/create.dto';

@Injectable()
export class CommunityMemberService {
  constructor(
    @InjectModel(CommunityMembers)
    private readonly communityMemberModel: typeof CommunityMembers,
  ) {}

  public async create(
    payload: CreateCommunityMemberDto,
    opts?: CreateOptions<CommunityMembersAttributes>,
  ) {
    return await this.communityMemberModel.create(payload, opts);
  }

  public async deleteAllCommunityMember(
    communityId: number,
    opts?: DestroyOptions<CommunityMembersAttributes>,
  ) {
    return await this.communityMemberModel.destroy({
      ...opts,
      where: { communityId },
    });
  }

  public async findByCommunityIdAndUserId(
    communityId: number,
    userId: string,
    opts?: FindOptions<CommunityMembersAttributes>,
  ) {
    return await this.communityMemberModel.findOne({
      ...opts,
      where: { communityId, userId },
    });
  }

  public async deleteByCommunityIdAndUserId(
    communityId: number,
    userId: string,
    opts?: Omit<DestroyOptions<CommunityMembersAttributes>, 'where'>,
  ) {
    return await this.communityMemberModel.destroy({
      ...opts,
      where: { communityId, userId },
    });
  }
}
