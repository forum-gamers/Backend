import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import {
  CommunityMembers,
  type CommunityMembersAttributes,
} from 'src/models/communitymember';
import { type CreateOptions } from 'sequelize';
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
}
