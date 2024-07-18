import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { RoomMember, type RoomMemberAttributes } from 'src/models/roommember';
import { CreateRoomMemberDto } from './dto/create.dto';
import { type CreateOptions } from 'sequelize';

@Injectable()
export class RoomMemberService {
  constructor(
    @InjectModel(RoomMember)
    private readonly roomMemberModel: typeof RoomMember,
  ) {}

  public async create(
    payload: CreateRoomMemberDto,
    opts?: CreateOptions<RoomMemberAttributes>,
  ) {
    return await this.roomMemberModel.create(payload, opts);
  }
}
