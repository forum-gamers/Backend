import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CommunityMembers } from 'src/models/communitymember';
import { CommunityMemberService } from './communityMember.service';

@Module({
  imports: [SequelizeModule.forFeature([CommunityMembers])],
  providers: [CommunityMemberService],
  exports: [CommunityMemberService],
})
export class CommunityMemberModule {}
